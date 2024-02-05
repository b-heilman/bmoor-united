# This is meant as an extra layer of abstraction for the network and will act as the 
# primary point of control for training it.
from typing import Type

from .context import ModelContext
from .trainer import ModelTrainer_Abstract
from .network import ModelNetwork_Abstract
from .analyzer import ModelAnalyzer_Abstract
from .model_interface import ModelData

class Model_Abstract:
    context: ModelContext
    network: ModelNetwork_Abstract
        
    # https://dagster.io/blog/python-type-hinting
    def train(
        self,
        context: ModelContext, 
        training_data: ModelData, 
        trainer: ModelTrainer_Abstract,
        NetworkClass: Type[ModelNetwork_Abstract]
    ) -> ModelTrainer_Abstract:
        self.context = context

        trainer.build(context)

        self.network = NetworkClass(context)

        trainer.train(training_data, self.network)

        return trainer
    
    def analyze(
        self,
        analysis_data: ModelData, 
        analyzer: ModelAnalyzer_Abstract
    ) -> ModelAnalyzer_Abstract:
        analyzer.build(self.context)

        analyzer.analyze(analysis_data, self.network)

        return analyzer
    
    def save(self, path: str):
        self.context.save(path)
        self.network.save(path)
    
    def load(self, path: str):
        self.context = ModelContext()
        self.context.load(path)

        pickle = {
            'config': {},
            'NetworkClass': ModelNetwork_Abstract
        }

        self.network = pickle['NetworkClass'](pickle['config'])

        return self.network.load(path)