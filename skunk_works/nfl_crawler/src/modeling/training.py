import os
import torch
import pandas as pd
import pathlib

from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score

from .compare import Compare
from .stats import dataset

base_dir = str(pathlib.Path(__file__).parent.resolve())
temp_parquet_path = os.path.abspath(base_dir + "/../../cache/parquet/{}_analytics.parquet")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

features = len(dataset.info['fields']) + len(dataset.info['ratings'])
player_embeddings = int(features / 2)
team_embeddings = features

num_epochs = 300
model = Compare({
    'player': {
        'layers': 2,
        'input': features,
        'hidden': features * 2,
        'output': player_embeddings,
        'activate': 'selu',
        'finalize': 'selu'
    },
    'team': {
        'layers': 2,
        'input': player_embeddings * 12,
        'hidden': player_embeddings * 12 * 2,
        'output': team_embeddings,
        'activate': 'selu',
        'finalize': 'selu'
    },
    'compare': {
        'layers': 5,
        'input': team_embeddings,
        'hidden': team_embeddings * 2,
        'output': 1,
        'activate': 'selu',
        'finalize': 'selu'
    },
}).to(device)

generator = torch.Generator().manual_seed(42)
# dataset.set_mask({'0.0': -1.0, '1.0': 1.0})
traing_set, val_set = torch.utils.data.random_split(
    dataset, 
    [0.75, 0.25], 
    generator=generator
)

print('sanity ->', len(traing_set), len(val_set))

training_loader = DataLoader(traing_set, batch_size=10, shuffle=True)
validation_loader = DataLoader(val_set, batch_size=10, shuffle=True)
# criterion = torch.nn.BCELoss()  # for 0 to 1
criterion = torch.nn.MSELoss() # for -1 to 1
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

def train():
    best_state = None
    best_loss = 100
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        for home, away, labels in training_loader:
            home, away, labels = home.to(device), away.to(device), labels.to(device)

            # Forward pass
            outputs = model(home, away).squeeze()
            loss = criterion(outputs, labels)

            # Backward pass and optimization
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            running_loss += loss.item()

        agg_loss = running_loss/len(training_loader)
        if best_loss > agg_loss:
            best_loss = agg_loss
            best_state = model.state_dict()

        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {agg_loss:.6f}")

    # print('======')
    # print(model.state_dict())
    # print(best_state)

    model.load_state_dict(best_state)



def accuracy(label: str):
    all_probs = []
    all_preds = []
    all_labels = []
    all_expected = []
    all_home = []
    all_away = []

    with torch.no_grad():  # No need to compute gradients during testing
        for home, away, labels in validation_loader:
            home, away, labels = home.to(device), away.to(device), labels.to(device)

            home_embeddings, away_embeddings = model.embed(home, away)

            probs = model.similarity(
                home_embeddings, away_embeddings
            ).squeeze().cpu().numpy()
            
            all_labels.extend(labels.cpu().numpy())
            all_expected.extend(labels.cpu().numpy() > 0.3)
            all_probs.extend(probs)
            all_preds.extend(probs > 0.3)
            all_home.extend(home_embeddings.cpu().numpy())
            all_away.extend(away_embeddings.cpu().numpy())

    results_df = pd.DataFrame({
        'labels': all_labels,
        'expect': all_expected,
        'probability': all_probs,
        'prediction': all_preds,
        'home': all_home,
        'away': all_away
    })

    results_df.to_parquet(temp_parquet_path.format(label))

    # Calculate Accuracy
    accuracy = accuracy_score(all_expected, all_preds)
    print(f"Test Accuracy: {accuracy:.4f}")