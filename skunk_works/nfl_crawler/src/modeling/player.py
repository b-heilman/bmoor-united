import torch

from typing import TypedDict

class PlayerSettings(TypedDict):
    features: int
    embeddings: int

class Player(torch.nn.Module):
    def __init__(self, settings: PlayerSettings):
        super().__init__()

        self.features = n_input = settings["features"]
        n_hidden = n_input*2
        n_out = settings["embeddings"]

        self.process = torch.nn.Sequential(
            torch.nn.Linear(n_input, n_hidden),
            torch.nn.Sigmoid(),
            # orch.nn.Linear(n_hidden, n_hidden),
            # torch.nn.ReLU(inplace=True),
            # torch.nn.Linear(n_hidden, n_hidden),
            # torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_out),
        )

        self.finalize = lambda v: torch.nn.functional.normalize(v)

    # https://stackoverflow.com/questions/26414913/normalize-columns-of-a-dataframe
    # https://stackoverflow.com/questions/69292727/pytorch-how-to-normalize-transform-data-manually-for-dataloader
    def forward(self, input):
        #print('--player::forward--', input.size())
        #print(input)
        proc = self.process(input)
        #print(proc)
        rtn = self.finalize(proc)
        #print(rtn)
        #print('------')
        return rtn
