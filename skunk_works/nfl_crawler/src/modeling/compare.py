import torch

from .processor import ProcessorSettings, Processor
from .team import Team, TeamSettings

class CompareSettings(TeamSettings):
    compare: ProcessorSettings

class Compare(Processor):
    def __init__(self, settings: CompareSettings):
        print(settings)
        super().__init__(settings['compare'])

        self.home = self.away = Team(settings)
        # self.away = Team(settings)

        # https://datastax.medium.com/how-to-implement-cosine-similarity-in-python-505e8ec1d823
        self.finalize = lambda home, away: self.similarity(home, away)

        #TODO: when doing cosine, do I need to run process?

    def embed(self, home, away):
        return self.home(home), self.away(away)
    
    def similarity(self, home_embeddings, away_embeddings):
        return torch.nn.functional.cosine_similarity(
            home_embeddings, 
            away_embeddings, 
            dim=1
        )

    def forward(self, home, away):
        return self.finalize(
            self.home(home), 
            self.away(away)
        )