import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset

# Custom dataset for team data
class TeamDataset(Dataset):
    def __init__(self, team_features, targets):
        """
        Args:
            team_features: Tensor of shape (N, D) where N is the number of teams and D is the feature size.
            targets: Tensor of similarity scores for pairs (e.g., shape (M,)) where M is the number of pair comparisons.
        """
        self.team_features = team_features
        self.targets = targets
        self.pairs = self.generate_pairs(len(team_features))  # Generate all pairs of teams

    def generate_pairs(self, num_teams):
        """Generate all possible team pairs (upper triangle of similarity matrix)."""
        pairs = []
        for i in range(num_teams):
            for j in range(i + 1, num_teams):
                pairs.append((i, j))
        return pairs

    def __len__(self):
        return len(self.pairs)

    def __getitem__(self, idx):
        team1_idx, team2_idx = self.pairs[idx]
        team1 = self.team_features[team1_idx]
        team2 = self.team_features[team2_idx]
        target = self.targets[idx]
        return team1, team2, target

# Simple model to learn embeddings
class TeamEmbeddingModel(nn.Module):
    def __init__(self, n_input, n_out):
        super(TeamEmbeddingModel, self).__init__()
        n_hidden = n_input * 2
        # self.fc = nn.Linear(input_dim, embedding_dim)
        self.fc = torch.nn.Sequential(
            torch.nn.Linear(n_input, n_hidden),
            torch.nn.Sigmoid(),
            torch.nn.Linear(n_hidden, n_hidden),
            torch.nn.Sigmoid(),
            torch.nn.Linear(n_hidden, n_hidden),
            torch.nn.Sigmoid(),
            torch.nn.Linear(n_hidden, n_out),
        )

    def forward(self, x):
        return F.normalize(self.fc(x), p=2, dim=1)  # L2-normalized embeddings

# Define the training loop
def train(model, dataloader, optimizer, loss_fn, epochs=10):
    model.train()
    for epoch in range(epochs):
        total_loss = 0
        for team1, team2, target in dataloader:
            team1, team2, target = team1.to(device), team2.to(device), target.to(device)

            # Forward pass
            embedding1 = model(team1)
            embedding2 = model(team2)
            
            # Compute cosine similarity
            cosine_similarity = F.cosine_similarity(embedding1, embedding2, dim=1)
            
            # Loss
            loss = loss_fn(cosine_similarity, target)
            
            # Backpropagation
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()

        print(f"Epoch {epoch + 1}/{epochs}, Loss: {total_loss / len(dataloader)}")

# Data Preparation (Example)
# Random team features and similarity scores
torch.manual_seed(42)
num_teams = 10
feature_dim = 5
embedding_dim = 3

team_features = torch.randn(num_teams, feature_dim)  # Random features for teams
true_similarity = torch.rand(num_teams * (num_teams - 1) // 2)  # Random similarity targets

print(true_similarity)
# Hyperparameters
batch_size = 4
learning_rate = 0.01
epochs = 20

# Dataset and DataLoader
dataset = TeamDataset(team_features, true_similarity)
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

# Model, optimizer, and loss function
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = TeamEmbeddingModel(feature_dim, embedding_dim).to(device)
optimizer = optim.Adam(model.parameters(), lr=learning_rate)
loss_fn = nn.MSELoss()  # Mean squared error for cosine similarity targets

# Train the model
train(model, dataloader, optimizer, loss_fn, epochs)
