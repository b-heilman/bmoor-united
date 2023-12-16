import os
import json
import math
import torch
import numpy as np
import pickle
import psutil
import random as rd
import multiprocessing as mp

from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import MinMaxScaler

from lib.common import (
    load_training_data, 
    create_training_info, 
    calc_statistics,
    train_model,
    analyze_model,
    FeatureSet,
    TrainingPair,
    TrainingStats,
    ModelAbstract
)

le = LabelEncoder()

saveDir = os.path.abspath(os.path.dirname(__file__)+'../../../cache')

STATS_PATH = saveDir+'/stats.json'
MODEL_PATH = saveDir+'/model.torch'
SCALAR_PATH = saveDir+'/transformer.pkl'

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
        n_input2 = (n_embeddings) * 2
        n_hidden2 = n_embeddings**2
        n_out = 6 # number of labels we'r trying to match

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
        # distance = self.distance(output1, output2)
        # distance = distance.view(distance.size()[0], -1)
        output = torch.cat((output1, output2), 1)

        # pass the concatenation to the linear layers
        output = self.fc(output)

        # pass the out of the linear layers to sigmoid layer
        output = self.sigmoid(output)
        
        return output
        
def _train(model, shard_inputs, shard_ouputs, loss_fn, proc_id, seed, threads):
    torch.manual_seed(seed)
    rd.seed(seed)

    epochs = 5000
    learning_rate = 0.01

    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    torch.set_num_threads(threads)

    losses = []
    for epoch in range(epochs):
        optimizer.zero_grad()

        predictions = model(shard_inputs)
        loss = loss_fn(predictions, shard_ouputs)
        loss_value = loss.item()
        losses.append(loss.item())

        if epoch % 500 == 0:
            #print(list(model.parameters())[0])
            print(f'Epoch {proc_id}-{epoch}: train loss: {loss_value}')

        loss.backward()

        optimizer.step()

class NeuralClassifier(ModelAbstract):
    stats: TrainingStats
    model: torch.nn.Sequential
    scaler: MinMaxScaler

    # https://www.datatechnotes.com/2019/07/classification-example-with.html
    def create(self, stats: TrainingStats):
       self.stats = stats
       self.model = SiameseNetwork(stats)

    def train(self, training_input, training_output, loss_fn, seed):
        process = psutil.Process().memory_info()
        system = psutil.virtual_memory()
        cpus = int(mp.cpu_count())

        available = math.floor(system.available / process.rss)
        # processes needs to be based on memory footprint
        processes = available + 1  # math.floor(len(training_chunks) / cpus)
        if processes < 2:
            processes = 1

        # can't overload the CPU
        threads = math.floor(cpus / processes)
        if threads == 0:
            threads = 1

        shards = [
            [training_input, training_output]
        ]

        print('--processing--', processes, threads)

        self.model.train()
        self.model.share_memory()
        processes = []
        for i, shard in enumerate(shards):
            print("spawning", i)
            p = mp.Process(target=_train, args=(
                self.model, shard[0], shard[1], loss_fn, i, seed, threads
            ))
            p.start()
            processes.append(p)

        for p in processes:
            p.join()

        print('-- model trained --')

    def fit(self, training: TrainingPair, validation: TrainingPair):
        seed = 42

        rd.seed(seed)
        # https://pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html

        #--- Prep ---
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

        #new_shape = (len(training["labels"]), 1)
        #training_output = training_output.view(new_shape)

        #new_shape = (len(validation["labels"]), 1)
        #validation_output = validation_output.view(new_shape)
        
        #--- Config --- 
        loss_fn = torch.nn.BCELoss()

        #--- Baseline --- 
        print("-- model created --")
        self.model.eval()
        predictions = self.model(validation_input)
        train = loss_fn(predictions, validation_output)
        
        print('Test loss before training' , train.item())
        print('--training data--')
        print(training_input.size())
        print(training_output.size())

        #--- Training --- 
        self.train(training_input, training_output, loss_fn, seed)
        
        #--- Analysis --- 
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

        return list(self.model(features).detach().numpy())
    
    def save(self):
        with open(STATS_PATH, 'w', encoding='utf-8') as file:
            json.dump(self.stats, file)

        torch.save(self.model.state_dict(), MODEL_PATH)

        pickle.dump(self.scaler, open(SCALAR_PATH, 'wb'))
    
    def load(self):
        with open(STATS_PATH, 'r', encoding='utf-8') as file:
            stats = json.load(file)

        self.create(stats)

        self.model.load_state_dict(torch.load(MODEL_PATH))
        self.scaler = pickle.load(open(SCALAR_PATH, 'rb'))

if __name__ == "__main__":
    model = train_model(NeuralClassifier)

    model.save()

    analyze_model(model)

