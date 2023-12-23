import os
import json
import math
import torch
import numpy as np
import numpy.typing as npt
import pickle
import psutil
import random as rd
import torch.multiprocessing as mp

from typing import List, Tuple
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import MinMaxScaler

from lib.common import (
    FEATURES_POS,
    LABEL_POS,
    STATS_POS,
    KEYS_POS,
    train_scaler,
    scale_processing,
    train_model,
    analyze_model,
    FeatureSet,
    ProcessingPair,
    TrainingStats,
    ModelAbstract
)

le = LabelEncoder()

saveDir = os.path.abspath(os.path.dirname(__file__)+'../../../cache')

STATS_PATH = saveDir+'/stats.json'
MODEL_PATH = saveDir+'/model.torch'
SCALAR_PATH = saveDir+'/transformer.pkl'

FeaturesShape = List[Tuple[List[float], List[float]]]
LabelsShape = List[float]
IncomingShape = Tuple[FeaturesShape, LabelsShape]
IncomingStats = dict

class SiameseNetwork(torch.nn.Module):
    def __init__(self, stats: IncomingStats):
        super(SiameseNetwork, self).__init__()

        # TODO: I will split these in the next iteration
        # np.arange(16.0).reshape(4, 4)
        # np.hsplit(x, np.array([3, 6]))
        n_input = stats["offense"] + stats["defense"] + stats["team"]
        n_hidden = math.ceil(n_input**2)
        n_embeddings = 3
        n_input2 = (n_embeddings) * 2
        n_hidden2 = math.ceil(n_embeddings**2)
        n_out = stats['label'] # number of labels we'r trying to match

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

    def forward(self, input: FeatureSet):
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
    shard_inputs = torch.FloatTensor(np.array(shard_inputs))
    shard_ouputs = torch.FloatTensor(np.array(shard_ouputs))

    print(f'--training data-- {proc_id}')
    print(shard_inputs.size())
    print(shard_ouputs.size())

    torch.manual_seed(seed)
    rd.seed(seed)

    epochs = 10000
    learning_rate = 0.05

    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    torch.set_num_threads(threads)

    for epoch in range(epochs+1):
        optimizer.zero_grad()
        predictions = model(shard_inputs)
        
        loss = loss_fn(predictions, shard_ouputs)
        loss_value = loss.item()
        
        if epoch % 500 == 0:
            #print(list(model.parameters())[0])
            print(f'Epoch {proc_id}-{epoch}: train loss: {loss_value}')

        
        loss.backward()

        optimizer.step()

# I'll evolve this over time
def create_shards(inputs, outputs, min_size = 100, simple=False):
    base = inputs[0]
    compare = inputs[1]

    input_count = len(base)
    shard_target = math.floor(input_count / min_size)

    process = psutil.Process().memory_info()
    system = psutil.virtual_memory()
    cpus = int(mp.cpu_count())
    
    if simple:
        processes = 1
        threads = cpus
    else:
        # divide by 2 because I want two threads per process at the least
        available = math.floor((system.available / process.rss) / 2)
        
        # processes needs to be based on memory footprint
        ideal = math.floor(shard_target / cpus)

        processes = ideal if ideal < available else available
        if processes < 2:
            processes = 2

        # can't overload the CPU
        threads = math.floor(cpus / processes)
        if threads == 0:
            processes = 1
            threads = cpus

    shard_size = math.ceil(input_count / processes)

    print('--processing--', input_count, processes, threads, shard_size)

    shards = []
    for x in range(0, input_count, shard_size):
        shards.append([
            (np.copy(base[x:x+shard_size]), np.copy(compare[x:x+shard_size])), 
            np.copy(outputs[x:x+shard_size])
        ])

    return shards, threads

def format_features(features: FeatureSet):
    base = []
    compare = []

    for row in features:
        base.append(row[0])
        compare.append(row[1])

    return np.array([base, compare])


class NeuralClassifier(ModelAbstract):
    stats: TrainingStats
    model: torch.nn.Sequential
    scaler: MinMaxScaler

    # https://www.datatechnotes.com/2019/07/classification-example-with.html
    def create(self, stats: TrainingStats):
       self.stats = stats
       self.model = SiameseNetwork(stats)

    def train(self, training_input, training_output, loss_fn, seed):
        shards, threads = create_shards(training_input, training_output, simple=True)

        self.model.train()
        
        processes = []

        if len(shards) > 1:
            mp.set_start_method('spawn', force=True)
            self.model.share_memory()

            for i in range(len(shards)):
                shard = shards[i]
                print("spawning", i)
                p = mp.Process(target=_train, args=(
                    self.model, shard[0], shard[1], loss_fn, i, seed, threads
                ))
                p.start()
                processes.append(p)

            for p in processes:
                p.join()
        else:
            shard = shards[0]
            _train(self.model, shard[0], shard[1], loss_fn, 0, seed, threads)

    def fit(self, training: ProcessingPair, validation: ProcessingPair):
        seed = 42

        rd.seed(seed)
        # https://pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html

        #--- Prep ---
        self.scaler = train_scaler(training)

        scale_processing(training[FEATURES_POS], self.scaler)
        scale_processing(validation[FEATURES_POS], self.scaler)

        # We convert these into tensors after sharding
        # If I create the tensors here and then shard, forking causes an error in
        # memory
        training_input = format_features(training[FEATURES_POS])
        training_output = training[LABEL_POS]

        validation_input = torch.FloatTensor(format_features(validation[FEATURES_POS]))
        validation_output = torch.FloatTensor(validation[LABEL_POS])

        #new_shape = (len(training["labels"]), 1)
        #training_output = training_output.view(new_shape)

        #new_shape = (len(validation["labels"]), 1)
        #validation_output = validation_output.view(new_shape)
        
        #--- Config --- 
        loss_fn = torch.nn.BCELoss()

        #--- Baseline --- 
        print("-- model created --")
        self.model.eval()
        with torch.no_grad():
            predictions = self.model(validation_input)
            # print(validation_input.size())
            # print(predictions.size())
            before = loss_fn(predictions, validation_output)
            
            print('Test loss before training' , before.item())

        #--- Training --- 
        self.train(training_input, training_output, loss_fn, seed)
        
        print('--trained--')

        #--- Analysis --- 
        self.model.eval()
        with torch.no_grad():
            predictions = self.model(validation_input)
            after = loss_fn(predictions, validation_output)
            print('Test loss after training' , after.item())

    def get_feature_importances(self):
        return []
        
    def predict(self, features: FeatureSet):
        scale_processing(features, self.scaler)

        features = torch.FloatTensor(format_features(features))

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

