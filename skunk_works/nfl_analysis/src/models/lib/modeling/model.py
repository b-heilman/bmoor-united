# This is meant as an extra layer of abstraction for the network and will act as the 
# primary point of control for training it.
import pickle

from typing import Type

from .loader import ModelLoader_Abstract
from .context import ModelContext
from .trainer import ModelTrainer_Abstract
from .trainer_interface import ModelTrainerResult
from .network import ModelNetwork_Abstract
from .analyzer import ModelAnalyzer_Abstract
from .analyzer_interface import ModelAnalyzerResult

class Model_Abstract:
    context: ModelContext
    network: ModelNetwork_Abstract
        
    # https://dagster.io/blog/python-type-hinting
    def train(
        self,
        context: ModelContext, 
        training_loader: ModelLoader_Abstract, 
        trainer: ModelTrainer_Abstract,
        NetworkClass: Type[ModelNetwork_Abstract]
    ) -> ModelTrainerResult:
        self.context = context

        trainer.build(context)

        self.network = NetworkClass(context)

        return trainer.train(training_loader, self.network)
    
    
    def analyze(
        self,
        analysis_loader: ModelLoader_Abstract, 
        analyzer: ModelAnalyzer_Abstract
    ) -> ModelAnalyzerResult:
        analyzer.build(self.context)

        return analyzer.analyze(analysis_loader, self.network)
    
    
    def save(self, path: str):
        with open(path+'/context.pkl', 'wb') as fp:
            pickle.dump(self.context, fp)

        with open(path+'/network.pkl', 'wb') as fp:
            pickle.dump(self.network, fp)

        self.network.save(path)

    
    def load(self, path: str):
        with open(path+'/context.pkl', 'rb') as fp:
            self.context = pickle.load(fp)

        with open(path+'/network.pkl', 'rb') as fp:
            self.network = pickle.load(fp)

        self.network.load(path)