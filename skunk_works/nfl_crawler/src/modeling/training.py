import os
import torch
import pandas as pd
import pathlib

from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score

from .model import Model
from .stats import dataset

base_dir = str(pathlib.Path(__file__).parent.resolve())
temp_parquet_path = os.path.abspath(base_dir + "/../../cache/parquet/{}_analytics.parquet")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = Model({
    'embeddings': 5,
    'features': len(dataset.info['fields']) + len(dataset.info['ratings'])
}).to(device)

generator = torch.Generator().manual_seed(42)
# dataset.set_mask({'0.0': -1.0, '1.0': 1.0})
traing_set, val_set = torch.utils.data.random_split(
    dataset, 
    [0.75, 0.25], 
    generator=generator
)

print('sanity ->', len(traing_set), len(val_set))
num_epochs = 30
training_loader = DataLoader(traing_set, batch_size=10, shuffle=True)
validation_loader = DataLoader(val_set, batch_size=10, shuffle=True)
# criterion = torch.nn.BCELoss()  # Binary Cross-Entropy Loss
criterion = torch.nn.MSELoss() # for cosine similarity
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

def train():
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

        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {running_loss/len(training_loader):.4f}")
   
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