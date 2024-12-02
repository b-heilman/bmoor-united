import torch

from .processor import ProcessorSettings, Processor
from .team import Team, TeamSettings

class CompareSettings(TeamSettings):
    compare: ProcessorSettings

class Compare(Processor):
    def __init__(self, settings: CompareSettings):
        super().__init__(settings['compare'])

        self.home = self.away = Team(settings)
        self.away = Team(settings)

        # https://datastax.medium.com/how-to-implement-cosine-similarity-in-python-505e8ec1d823
        # self.compute = lambda home, away: self.similarity(home, away)
        self.compute = lambda home, away: self.probability(home, away)

    def embed(self, home, away):
        h = self.home(home)
        a = self.away(away)

        return h, a
    
    def probability(self, home_embeddings, away_embeddings):
        return super().forward(torch.sub(home_embeddings, away_embeddings))
    
    def similarity(self, home_embeddings, away_embeddings):
        return torch.nn.functional.cosine_similarity(
            home_embeddings, 
            away_embeddings, 
            dim=1
        )

    def forward(self, home, away):
        h, a = self.embed(home, away)
        return self.compute(h, a)