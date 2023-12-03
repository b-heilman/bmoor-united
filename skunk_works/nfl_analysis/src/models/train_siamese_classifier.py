import json
import torch
import numpy as np

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
    compares = []
    againsts = []
    for feature in features:
        compares.append(feature['compare'])
        againsts.append(feature['against'])

    return np.array([
        scaler.transform(compares), 
        scaler.transform(againsts)
    ])

class SiameseNetwork(torch.nn.Module):
    def __init__(self, stats: TrainingStats):
        super(SiameseNetwork, self).__init__()

        n_input = stats["features"]
        n_hidden = n_input**2
        n_embeddings = 3
        n_input2 = (n_embeddings) * 2 + 1
        n_hidden2 = n_embeddings**2
        n_out = 1

        print({
            'input': n_input,
            'hidden': n_hidden,
            'embedding': n_embeddings,
            'input2': n_input2,
            'hidden2': n_hidden2,
            'out': n_out
        })

        self.cnn = torch.nn.Sequential(
            torch.nn.Linear(n_input, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_embeddings),
        )

        self.fc = torch.nn.Sequential(
            torch.nn.Linear(n_input2, n_hidden2),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden2, n_hidden2),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden2, n_out),
        )

        self.distance = torch.nn.PairwiseDistance(p=2)

        self.sigmoid = torch.nn.Sigmoid()

    # https://github.com/pytorch/examples/blob/main/siamese_network/main.py
    
    def forward_once(self, input):
        output = self.cnn(input)
        output = output.view(output.size()[0], -1)

        return output # n x 3

    def forward(self, input):
        # get two images' features
        input1 = input[0]
        input2 = input[1]
        
        output1 = self.forward_once(input1)
        output2 = self.forward_once(input2)

        # concatenate both images' features
        distance = self.distance(output1, output2)
        distance = distance.view(distance.size()[0], -1)
        output = torch.cat((output1, output2, distance), 1) # n x 7

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
        learning_rate = 0.05
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

        new_shape = (len(training["labels"]), 1)
        training_output = training_output.view(new_shape)

        new_shape = (len(validation["labels"]), 1)
        validation_output = validation_output.view(new_shape)
        
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

if __name__ == "__main__":
    train_model(NeuralClassifier)