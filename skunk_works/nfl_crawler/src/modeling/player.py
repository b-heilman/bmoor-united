import torch

from typing import TypedDict

class PlayerSettings(TypedDict):
    features: int
    embeddings: int

class Player(torch.nn.Module):
    def __init__(self, settings: PlayerSettings):
        super().__init__(self)

        n_input = settings["features"]
        n_hidden = n_input**2
        n_out = settings["embeddings"]

        self.process = torch.nn.Sequential(
            torch.nn.Linear(n_input, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_hidden),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_out),
        )

        self.finalize = torch.nn.Linear()

    # https://github.com/pytorch/examples/blob/main/siamese_network/main.py

    def forward(self, input):
        return self.finalize(self.process(input))
