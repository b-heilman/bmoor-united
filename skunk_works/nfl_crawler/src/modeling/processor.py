import torch

from typing import TypedDict

class ProcessorSettings(TypedDict):
    input: int
    hidden: int
    output: int
    layers: int
    activate: str
    finalize: str

def _get_activation(type):
    if type == 'relu':
        return torch.nn.ReLU(inplace=True)
    else:
        return torch.nn.Sigmoid()
    
def _get_finalization(type):
    if type == 'normalize':
        return lambda x: torch.nn.functional.normalize(x)
    else:
        return lambda x: x
class Processor(torch.nn.Module):
    def __init__(self, settings: ProcessorSettings):
        super().__init__()

        self.settings = settings

        params = [
            torch.nn.Linear(settings['input'], settings['hidden']),
            _get_activation(settings['activate'])
        ]

        for i in range(settings['layers'] - 1):
            params.append(
                torch.nn.Linear(settings['hidden'], settings['hidden'])
            )
            params.append(
                _get_activation(settings['activate'])
            )

        params.append(
            torch.nn.Linear(settings['hidden'], settings['output'])
        )
        
        self.process = torch.nn.Sequential(*params)
        self.finalize = _get_finalization(settings['finalize'])

    def forward(self, input):
        return self.finalize(self.process(input))
