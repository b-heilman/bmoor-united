import torch

from .team import Team, TeamSettings

class ModelSettings(TeamSettings):
    pass

class Model(torch.nn.Module):
    def __init__(self, settings: ModelSettings):
        super().__init__()

        self.home = self.away = Team(settings)
        self.away = Team(settings)

        n_input = settings['embeddings']
        n_hidden = n_input # * 2
        n_out = 1

        self.process = torch.nn.Sequential(
            torch.nn.Linear(n_input, n_hidden),
            torch.nn.Sigmoid(),
            torch.nn.Linear(n_hidden, n_hidden),
            #torch.nn.Sigmoid(),
            #torch.nn.Linear(n_hidden, n_hidden),
            #torch.nn.Sigmoid(),
            torch.nn.Linear(n_hidden, n_out),
        )

        self.finalize = torch.nn.Sigmoid()

    def embed(self, home, away):
        return self.home(home), self.away(away)
    
    def similarity(self, home_embeddings, away_embeddings):
        return torch.nn.functional.cosine_similarity(
            home_embeddings, 
            away_embeddings, 
            dim=1
        )

    def forward(self, home, away):
        # https://datastax.medium.com/how-to-implement-cosine-similarity-in-python-505e8ec1d823
        return torch.nn.functional.cosine_similarity(
            self.home(home), 
            self.away(away), 
            dim=1
        )
        #return self.finalize(
        #    self.process(
        #        # torch.cat((self.team(home), self.team(away)), 1)
        #        self.team(home) - self.team(away)
        #    )
        #)