import torch

from typing import TypedDict
from .player import Player, PlayerSettings
from .processor import ProcessorSettings, Processor

class TeamSettings(TypedDict):
    team: ProcessorSettings
    player: PlayerSettings

class Team(Processor):
    def __init__(self, settings: TeamSettings):
        super().__init__(settings['team'])

        self.qb1 = Player(settings['player'])
        self.rb1 = Player(settings['player'])
        self.rb2 = Player(settings['player'])
        self.wr1 = Player(settings['player'])
        self.wr2 = Player(settings['player'])
        self.wr3 = Player(settings['player'])
        self.passing = Player(settings['player'])
        self.receiving = Player(settings['player'])
        self.rushing = Player(settings['player'])
        self.team = Player(settings['player'])
        self.prime = Player(settings['player'])
        self.usage = Player(settings['player'])

    def forward(self, input):
        player_features = self.qb1.settings['input']

        embeddings = torch.cat((
            self.qb1(input[:,0:player_features]),
            self.rb1(input[:,player_features:player_features*2]),
            self.rb2(input[:,player_features*2:player_features*3]),
            self.wr1(input[:,player_features*3:player_features*4]),
            self.wr2(input[:,player_features*4:player_features*5]),
            self.wr3(input[:,player_features*5:player_features*6]),
            self.passing(input[:,player_features*6:player_features*7]),
            self.receiving(input[:,player_features*7:player_features*8]),
            self.rushing(input[:,player_features*8:player_features*9]),
            self.team(input[:,player_features*9:player_features*10]),
            self.prime(input[:,player_features*10:player_features*11]),
            self.usage(input[:,player_features*11:player_features*12]) 
        ), 1)

        return super().forward(embeddings)
