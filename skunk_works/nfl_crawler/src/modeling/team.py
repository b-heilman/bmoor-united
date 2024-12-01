import torch

from .player import Player, PlayerSettings

class TeamSettings(PlayerSettings):
    pass

class Team(torch.nn.Module):
    def __init__(self, settings: TeamSettings):
        super().__init__()

        self.settings = settings

        self.qb1 = Player(settings)
        self.rb1 = Player(settings)
        self.rb2 = Player(settings)
        self.wr1 = Player(settings)
        self.wr2 = Player(settings)
        self.wr3 = Player(settings)
        self.passing = Player(settings)
        self.receiving = Player(settings)
        self.rushing = Player(settings)
        self.team = Player(settings)
        self.prime = Player(settings)
        self.usage = Player(settings)

        n_input = settings['embeddings'] * 12
        n_hidden = n_input # * 2
        n_out = settings['embeddings']

        self.process = torch.nn.Sequential(
            torch.nn.Linear(n_input, n_hidden),
            torch.nn.Sigmoid(),
            #torch.nn.Linear(n_hidden, n_hidden),
            #torch.nn.ReLU(inplace=True),
            #torch.nn.Linear(n_hidden, n_hidden),
            #torch.nn.ReLU(inplace=True),
            torch.nn.Linear(n_hidden, n_out),
        )

        self.finalize = torch.nn.Sigmoid()

    def forward(self, input):
        # print('---> features', self.settings['features'])
        # print(input.size())
        embeddings = torch.cat((
            self.qb1(input[:,0:self.settings['features']]),
            self.rb1(input[:,self.settings['features']:self.settings['features']*2]),
            self.rb2(input[:,self.settings['features']*2:self.settings['features']*3]),
            self.wr1(input[:,self.settings['features']*3:self.settings['features']*4]),
            self.wr2(input[:,self.settings['features']*4:self.settings['features']*5]),
            self.wr3(input[:,self.settings['features']*5:self.settings['features']*6]),
            self.passing(input[:,self.settings['features']*6:self.settings['features']*7]),
            self.receiving(input[:,self.settings['features']*7:self.settings['features']*8]),
            self.rushing(input[:,self.settings['features']*8:self.settings['features']*9]),
            self.team(input[:,self.settings['features']*9:self.settings['features']*10]),
            self.prime(input[:,self.settings['features']*10:self.settings['features']*11]),
            self.usage(input[:,self.settings['features']*11:self.settings['features']*12]) 
        ), 1)

        return self.finalize(self.process(embeddings))
