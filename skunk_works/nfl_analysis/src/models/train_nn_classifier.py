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

def format_features(features: FeatureSet):
    rtn = []
    for feature in features:
        rtnRow = []
        for i, value1 in enumerate(feature['compare']):
            value2 = feature['against'][i]

            rtnRow.append(value1 - value2)

        rtn.append(rtnRow)

    return rtn

class NeuralNetwork(torch.nn.Module):
    def __init__(self, stats: TrainingStats):
        super(NeuralNetwork, self).__init__()

        n_input = stats["features"]
        n_hidden = n_input**2
        n_out = 1

        self.fc = torch.nn.Sequential(
            torch.nn.Linear(n_input, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_out),
        )

        self.sigmoid = torch.nn.Sigmoid()

    # https://github.com/pytorch/examples/blob/main/siamese_network/main.py
    
    def forward(self, input):
        output = self.fc(input)

        # pass the out of the linear layers to sigmoid layer
        output = self.sigmoid(output)
        
        return output
        

class NeuralClassifier(ModelAbstract):
    model: torch.nn.Sequential
    scaler: MinMaxScaler

    # https://www.datatechnotes.com/2019/07/classification-example-with.html
    def create(self, stats: TrainingStats):
       self.model = NeuralNetwork(stats)

    def fit(self, training: TrainingPair, validation: TrainingPair):
        # https://pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html
        learning_rate = 0.01
        epochs = 5000

        self.scaler = MinMaxScaler()
        base_features = format_features(training["features"])
        self.scaler.fit(base_features)

        training_input = torch.FloatTensor(self.scaler.transform(base_features))
        training_output = torch.FloatTensor(training["labels"])

        validation_input = torch.FloatTensor(self.scaler.transform(format_features(validation["features"])))
        validation_output = torch.FloatTensor(validation["labels"])

        new_shape = (len(training["labels"]), 1)
        training_output = training_output.view(new_shape)

        new_shape = (len(validation["labels"]), 1)
        validation_output = validation_output.view(new_shape)

        loss_fn = torch.nn.MSELoss()
        optimizer = torch.optim.SGD(self.model.parameters(), lr=learning_rate)
        
        print("-- model created --")
        self.model.eval()
        predictions = self.model(validation_input)
        print('==sanity==')
        print(predictions.size())
        print(validation_output.size())
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
        features = torch.FloatTensor(self.scaler.transform(format_features(features)))

        return list(map(lambda arr: arr[0], self.model(features).detach().numpy()))

if __name__ == "__main__":
    train_model(NeuralClassifier)