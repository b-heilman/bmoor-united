import json
import torch

from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import MinMaxScaler

from lib.common import (
    load_training_data, 
    create_training_info, 
    calc_statistics,
    train_model,
    FeatureSet,
    TrainingPair,
    TrainingStats,
    ModelAbstract
)

le = LabelEncoder()

def reduce_features(features: FeatureSet):
    rtn = []
    for feature in features:
        rtn.append(feature['compare'])
        rtn.append(feature['against'])

    return rtn

def format_features(features: FeatureSet, scaler: MinMaxScaler):
    rtn = []
    for feature in features:
        rtn.append(
            scaler.transform([feature['compare'], feature['against']])
        )

    return rtn

class SiameseNetwork(torch.nn.Module):
    def __init__(self, stats: TrainingStats):
        super(SiameseNetwork, self).__init__()

        n_input = stats["features"]
        n_hidden = n_input**2
        n_embeddings = 3
        n_hidden2 = n_embeddings**2
        n_out = 1

        self.cnn = torch.nn.Sequential(
            torch.nn.Linear(n_input, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_embeddings),
        )

        self.fc = torch.nn.Sequential(
            torch.nn.Linear(n_embeddings, n_hidden2),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden2, n_hidden2),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden2, n_out),
        )

        self.sigmoid = torch.nn.Sigmoid()

    # https://github.com/pytorch/examples/blob/main/siamese_network/main.py
    
    def forward_once(self, input):
        output = self.cnn(input)
        output = output.view(output.size()[0], -1)

        return output

    def forward(self, input):
        print('input', input)
        # get two images' features
        output1 = self.forward_once(input[0])
        output2 = self.forward_once(input[1])

        # concatenate both images' features
        output = torch.cat((output1, output2), 1)

        # pass the concatenation to the linear layers
        output = self.fc(output)

        # pass the out of the linear layers to sigmoid layer
        output = self.sigmoid(output)
        
        return output
        

class NeuralClassifier(ModelAbstract):
    model: torch.nn.Sequential
    scaler: MinMaxScaler

    # https://www.datatechnotes.com/2019/07/classification-example-with.html
    def create(self, stats: TrainingStats):
       self.model = SiameseNetwork(stats)

    def fit(self, training: TrainingPair, validation: TrainingPair):
        # https://pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html
        learning_rate = 0.01
        epochs = 5000

        self.scaler = MinMaxScaler()
        base_features = reduce_features(training["features"])
        self.scaler.fit(base_features)

        training_input = torch.FloatTensor(
            format_features(training["features"], self.scaler)
        )
        training_output = torch.FloatTensor(training["labels"])

        validation_input = torch.FloatTensor(
            format_features(validation["features"], self.scaler)
        )
        validation_output = torch.FloatTensor(validation["labels"])

        loss_fn = torch.nn.MSELoss()
        optimizer = torch.optim.SGD(self.model.parameters(), lr=learning_rate)

        print("-- model created --")
        self.model.eval()
        predictions = self.model(validation_input)
        train = loss_fn(predictions, validation_output)
        print('Test loss before training' , train.item())
        print('--training data--')
        print(training_input.size())
        print(training_output.size())

        self.model.train()
        losses = []
        for epoch in range(epochs):
            predictions = self.model(training_input)
            loss = loss_fn(predictions, training_output)
            loss_value = loss.item()
            losses.append(loss.item())

            if epoch % 500 == 0:
                #print(list(model.parameters())[0])
                print(f'Epoch {epoch}: train loss: {loss_value}')

            self.model.zero_grad()
            loss.backward()

            optimizer.step()
        
        self.model.eval()
        predictions = self.model(validation_input)
        train = loss_fn(predictions, validation_output)
        print('Test loss after training' , train.item())

    def get_feature_importances(self):
        return []
        
    def predict(self, features: FeatureSet):
        features = torch.FloatTensor(
            format_features(features, self.scaler)
        )

        return list(map(lambda arr: arr[0], self.model(features).detach().numpy()))

# TODO: need to integrate this
def train(args, model, device, train_loader, optimizer, epoch):
    model.train()

    # we aren't using `TripletLoss` as the MNIST dataset is simple, so `BCELoss` can do the trick.
    criterion = nn.BCELoss()

    for batch_idx, (images_1, images_2, targets) in enumerate(train_loader):
        images_1, images_2, targets = images_1.to(device), images_2.to(device), targets.to(device)
        optimizer.zero_grad()
        outputs = model(images_1, images_2).squeeze()
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()
        if batch_idx % args.log_interval == 0:
            print('Train Epoch: {} [{}/{} ({:.0f}%)]\tLoss: {:.6f}'.format(
                epoch, batch_idx * len(images_1), len(train_loader.dataset),
                100. * batch_idx / len(train_loader), loss.item()))
            if args.dry_run:
                break


def test(model, device, test_loader):
    model.eval()
    test_loss = 0
    correct = 0

    # we aren't using `TripletLoss` as the MNIST dataset is simple, so `BCELoss` can do the trick.
    criterion = nn.BCELoss()

    with torch.no_grad():
        for (images_1, images_2, targets) in test_loader:
            images_1, images_2, targets = images_1.to(device), images_2.to(device), targets.to(device)
            outputs = model(images_1, images_2).squeeze()
            test_loss += criterion(outputs, targets).sum().item()  # sum up batch loss
            pred = torch.where(outputs > 0.5, 1, 0)  # get the index of the max log-probability
            correct += pred.eq(targets.view_as(pred)).sum().item()

    test_loss /= len(test_loader.dataset)

    # for the 1st epoch, the average loss is 0.0001 and the accuracy 97-98%
    # using default settings. After completing the 10th epoch, the average
    # loss is 0.0000 and the accuracy 99.5-100% using default settings.
    print('\nTest set: Average loss: {:.4f}, Accuracy: {}/{} ({:.0f}%)\n'.format(
        test_loss, correct, len(test_loader.dataset),
        100. * correct / len(test_loader.dataset)))

train():
    model = SiameseNetwork()
    optimizer = optim.Adadelta(model.parameters(), lr=args.lr)

    scheduler = StepLR(optimizer, step_size=1, gamma=args.gamma)
    for epoch in range(1, 500 + 1):
        train(args, model, device, train_loader, optimizer, epoch)
        test(model, device, test_loader)
        scheduler.step()

if __name__ == "__main__":
    train_model(NeuralClassifier)