import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from torchvision.datasets import MNIST

# Siamese Network Definition
class SiameseNetwork(nn.Module):
    def __init__(self):
        super(SiameseNetwork, self).__init__()

        self.cnn = nn.Sequential(
            nn.Conv2d(1, 64, kernel_size=10),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=7),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )

        self.fc = nn.Sequential(
            nn.Linear(128 * 6 * 6, 500),
            nn.ReLU(inplace=True),
            nn.Linear(500, 500),
            nn.ReLU(inplace=True),
            nn.Linear(500, 5),
        )

    # https://github.com/pytorch/examples/blob/main/siamese_network/main.py
    
    def forward_once(self, x):
        output = self.cnn(x)
        output = output.view(output.size()[0], -1)

        return output

    def forward(self, input1, input2):
        # get two images' features
        output1 = self.forward_once(input1)
        output2 = self.forward_once(input2)

        # concatenate both images' features
        output = torch.cat((output1, output2), 1)

        # pass the concatenation to the linear layers
        output = self.fc(output)

        # pass the out of the linear layers to sigmoid layer
        output = self.sigmoid(output)
        
        return output


# Contrastive Loss
class ContrastiveLoss(nn.Module):
    def __init__(self, margin=2.0):
        super(ContrastiveLoss, self).__init__()
        self.margin = margin

    def forward(self, output1, output2, label):
        euclidean_distance = F.pairwise_distance(output1, output2, keepdim=True)
        loss_contrastive = torch.mean((1 - label) * torch.pow(euclidean_distance, 2) +
                                      (label) * torch.pow(torch.clamp(self.margin - euclidean_distance, min=0.0), 2))
        return loss_contrastive


# Custom Dataset
class SiameseDataset(Dataset):
    def __init__(self, dataset):
        self.dataset = dataset
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.5,), (0.5,))
        ])

    def __getitem__(self, index):
        img1, label1 = self.dataset[index]
        # Ensure that both samples are from the same class for positive samples
        should_get_same_class = torch.rand(1).item() > 0.5
        if should_get_same_class:
            while True:
                index2 = index
                img2, label2 = self.dataset[index2]
                if label1 == label2:
                    break
        else:
            index2 = index
            while index2 == index:
                index2 = torch.randint(len(self.dataset), size=(1,)).item()
            img2, label2 = self.dataset[index2]

        img1 = self.transform(img1)
        img2 = self.transform(img2)

        # Return image pair and a label (1 for same class, 0 for different classes)
        return img1, img2, torch.tensor([int(label1 == label2)], dtype=torch.float32)

    def __len__(self):
        return len(self.dataset)


# Training
def train_siamese_network(siamese_net, train_loader, criterion, optimizer, num_epochs=10):
    for epoch in range(num_epochs):
        for batch in train_loader:
            input1, input2, label = batch
            output1, output2 = siamese_net(input1, input2)
            loss = criterion(output1, output2, label)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        print(f"Epoch {epoch+1}/{num_epochs}, Loss: {loss.item()}")

# Example usage
if __name__ == "__main__":
    # Load MNIST dataset
    mnist_dataset = MNIST(root='./data', train=True, download=True)

    # Create Siamese Dataset
    siamese_dataset = SiameseDataset(mnist_dataset)
    siamese_loader = DataLoader(siamese_dataset, shuffle=True, batch_size=64)

    # Initialize Siamese Network, Loss, and Optimizer
    siamese_net = SiameseNetwork()
    criterion = ContrastiveLoss()
    optimizer = optim.Adam(siamese_net.parameters(), lr=0.001)

    # Train the Siamese Network
    train_siamese_network(siamese_net, siamese_loader, criterion, optimizer, num_epochs=5)
