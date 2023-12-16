import json
import math
import torch
import psutil
import multiprocessing as mp

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
        
def _train(model, shard_inputs, shard_ouputs, loss_fn):
    epochs = 5000
    learning_rate = 0.01

    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)

    model.train()
    losses = []
    for epoch in range(epochs):
        optimizer.zero_grad()

        predictions = model(shard_inputs)
        loss = loss_fn(predictions, shard_ouputs)
        loss_value = loss.item()
        losses.append(loss.item())

        if epoch % 500 == 0:
            #print(list(model.parameters())[0])
            print(f'Epoch {epoch}: train loss: {loss_value}')

        loss.backward()

        optimizer.step()

class NeuralClassifier(ModelAbstract):
    model: torch.nn.Sequential
    scaler: MinMaxScaler

    # https://www.datatechnotes.com/2019/07/classification-example-with.html
    def create(self, stats: TrainingStats):
       self.model = NeuralNetwork(stats)

    def train(self, training_input, training_output, loss_fn):
        process = psutil.Process().memory_info()
        system = psutil.virtual_memory()
        cpus = int(mp.cpu_count())

        available = math.floor(system.available / process.rss)
        # processes needs to be based on memory footprint
        processes = available + 1  # math.floor(len(training_chunks) / cpus)
        if processes < 2:
            processes = 2

        # can't overload the CPU
        threads = math.floor(cpus / processes)
        if threads == 0:
            threads = 1

        shards = [
            [training_input, training_output]
        ]

        self.model.train()
        self.model.share_memory()
        processes = []
        for i, shard in enumerate(shards):
            print("spawning", i)
            p = mp.Process(target=_train, args=(self.model, shard, i, seed, threads))
            p.start()
            processes.append(p)

        for p in processes:
            p.join()

        print('-- model trained --')

    def fit(self, training: TrainingPair, validation: TrainingPair):
        # https://pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html
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

        self.train(training_input, training_output, loss_fn)
        
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