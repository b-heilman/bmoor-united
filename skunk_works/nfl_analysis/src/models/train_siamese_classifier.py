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
    train_model,
    analyze_model,
    ProcessingPair,
    ProcessingStats,
    ModelAbstract,
)

le = LabelEncoder()

saveDir = os.path.abspath(os.path.dirname(__file__) + "../../../cache")

STATS_PATH = saveDir + "/stats.json"
MODEL_PATH = saveDir + "/model.torch"
SCALAR_PATH = saveDir + "/transformer.pkl"


class Encoder(torch.nn.Module):
    def __init__(self, n_input, n_ouput):
        super(Encoder, self).__init__()
        n_hidden = n_input * 4

        self.encode = torch.nn.Sequential(
            # I'm doing feature engineering leading into the model, so I don't think 
            # dropout will help me here.
            # torch.nn.Dropout(p=0.2),
            torch.nn.Linear(n_input, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_ouput),
        )

    def forward(self, input: torch.FloatTensor):
        return self.encode(input)


class SiameseNetwork(torch.nn.Module):
    def __init__(self, stats: ProcessingStats):
        super(SiameseNetwork, self).__init__()

        n_offense_input = len(stats["offense"])
        self.n_offense_input = n_offense_input

        n_defense_input = len(stats["defense"])
        self.n_defense_input = n_defense_input

        n_team_input = len(stats["team"])
        self.n_team_input = n_team_input

        n_embeddings_per = 2
        n_embeddings = 3 * n_embeddings_per
        n_input2 = (n_embeddings) * 2
        n_compare_hidden = math.ceil(n_embeddings**2)
        n_out = len(stats["labels"])  # number of labels we'r trying to match

        print(
            {
                "offense": n_offense_input,
                "defense": n_defense_input,
                "team": n_team_input,
                "embedding": n_embeddings,
                "input2": n_input2,
                "hidden2": n_compare_hidden,
                "out": n_out,
            }
        )

        self.offsense_encoder = Encoder(n_offense_input, n_embeddings_per)

        self.defense_encoder = Encoder(n_defense_input, n_embeddings_per)

        self.team_encoder = Encoder(n_team_input, n_embeddings_per)

        self.compare = torch.nn.Sequential(
            torch.nn.Linear(n_input2, n_compare_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_compare_hidden, n_out),
        )

        self.distance = torch.nn.PairwiseDistance(p=2)

        self.sigmoid = torch.nn.Sigmoid()

    # https://github.com/pytorch/examples/blob/main/siamese_network/main.py

    def forward_once(self, input):
        o_pos = self.n_offense_input
        d_pos = self.n_defense_input

        offense, defense, team = torch.tensor_split(
            input, (o_pos, o_pos + d_pos), dim=1
        )

        output = torch.cat(
            (
                self.offsense_encoder(offense),
                self.defense_encoder(defense),
                self.team_encoder(team),
            ),
            1,
        )

        return output.view(output.size()[0], -1)

    def forward(self, input: torch.FloatTensor):
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
        output = self.compare(output)

        # pass the out of the linear layers to sigmoid layer
        output = self.sigmoid(output)

        return output
    
    def encode(self, input: torch.FloatTensor):
        return self.forward_once(input)


def _train(model, shard_inputs, shard_ouputs, loss_fn, proc_id, seed, threads):
    shard_inputs = torch.FloatTensor(np.array(shard_inputs))
    shard_ouputs = torch.FloatTensor(np.array(shard_ouputs))

    print(f"--training data-- {proc_id}")
    print(shard_inputs.size())
    print(shard_ouputs.size())

    torch.manual_seed(seed)
    rd.seed(seed)

    epochs = 100000
    learning_rate = 0.05

    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    torch.set_num_threads(threads)

    for epoch in range(epochs + 1):
        optimizer.zero_grad()
        predictions = model(shard_inputs)

        loss = loss_fn(predictions, shard_ouputs)
        loss_value = loss.item()

        if epoch % 500 == 0:
            # print(list(model.parameters())[0])
            print(f"Epoch {proc_id}-{epoch}: train loss: {loss_value}")

        loss.backward()

        optimizer.step()


# I'll evolve this over time
def create_shards(inputs, outputs, min_size=100, simple=False):
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

    print("--processing--", input_count, processes, threads, shard_size)

    shards = []
    for x in range(0, input_count, shard_size):
        shards.append(
            [
                (
                    np.copy(base[x : x + shard_size]),
                    np.copy(compare[x : x + shard_size]),
                ),
                np.copy(outputs[x : x + shard_size]),
            ]
        )

    return shards, threads


class NeuralClassifier(ModelAbstract):
    stats: ProcessingStats
    model: SiameseNetwork
    scaler: MinMaxScaler

    # https://www.datatechnotes.com/2019/07/classification-example-with.html
    def create(self, stats: ProcessingStats):
        self.stats = stats
        self.model = SiameseNetwork(stats)

    def train(self, training_input, training_output, loss_fn, seed):
        shards, threads = create_shards(training_input, training_output, simple=True)

        self.model.train()

        processes = []

        if len(shards) > 1:
            mp.set_start_method("spawn", force=True)
            self.model.share_memory()

            for i in range(len(shards)):
                shard = shards[i]
                print("spawning", i)
                p = mp.Process(
                    target=_train,
                    args=(self.model, shard[0], shard[1], loss_fn, i, seed, threads),
                )
                p.start()
                processes.append(p)

            for p in processes:
                p.join()
        else:
            shard = shards[0]
            _train(self.model, shard[0], shard[1], loss_fn, 0, seed, threads)

    def fit(
        self,
        training: ProcessingPair,
        validation: ProcessingPair,
        stats: ProcessingStats,
    ):
        seed = 42

        rd.seed(seed)
        # https://pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html

        # --- Prep ---
        self.scale(training[0])
        self.scale(validation[0])

        # We convert these into tensors after sharding
        # If I create the tensors here and then shard, forking causes an error in
        # memory
        training_input = training[0]
        training_output = training[1]

        validation_input = torch.FloatTensor(validation[0])
        validation_output = torch.FloatTensor(validation[1])

        # new_shape = (len(training["labels"]), 1)
        # training_output = training_output.view(new_shape)

        # new_shape = (len(validation["labels"]), 1)
        # validation_output = validation_output.view(new_shape)

        # --- Config ---
        loss_fn = torch.nn.BCELoss()

        # --- Baseline ---
        print("-- model created --")
        self.model.eval()
        with torch.no_grad():
            predictions = self.model(validation_input)
            # print(validation_input.size())
            # print(predictions.size())
            before = loss_fn(predictions, validation_output)

            print("Test loss before training", before.item())
            print("--encodings--")
            print(self.model.encode(validation_input[1][0:4]))


        # --- Training ---
        self.train(training_input, training_output, loss_fn, seed)

        print("--trained--")

        # --- Analysis ---
        self.model.eval()
        with torch.no_grad():
            predictions = self.model(validation_input)
            after = loss_fn(predictions, validation_output)
            print("Test loss after training", after.item())
            print("--encodings--")
            print(self.model.encode(validation_input[1][0:4]))

    def get_feature_importances(self):
        return []

    def predict(self, content: npt.NDArray, stats: ProcessingStats):
        self.scale(content)

        features = torch.FloatTensor(content)

        return list(self.model(features).detach().numpy())

    def save(self):
        with open(STATS_PATH, "w", encoding="utf-8") as file:
            json.dump(self.stats, file)

        torch.save(self.model.state_dict(), MODEL_PATH)

        pickle.dump(self.scaler, open(SCALAR_PATH, "wb"))

    def load(self):
        with open(STATS_PATH, "r", encoding="utf-8") as file:
            stats = json.load(file)

        self.create(stats)

        self.model.load_state_dict(torch.load(MODEL_PATH))
        self.scaler = pickle.load(open(SCALAR_PATH, "rb"))


if __name__ == "__main__":
    model = train_model(NeuralClassifier)

    model.save()

    analyze_model(model)
