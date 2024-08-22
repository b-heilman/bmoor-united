
from .encoder import ModelEncoder_Abstract
from .classifier import ModelClassifier_Abstract

class ModelNetwork_Abstract:
    encoder: ModelEncoder_Abstract
    classifier: ModelClassifier_Abstract

    def save(self, path):
        return
    
    def __getstate__(self):
        # We save the loading of the encoder and classifier 
        return None
    
    def load(self, path):
        with open(path+'/') as fp:
