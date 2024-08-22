import sys
import math
import random

from typing import List, Tuple

if sys.version_info >= (3, 11):
    from typing import Self
else:
    from typing_extensions import Self

from .loader_interface import Features, Labels, ModelLoaderSource, ModelLoaderSet

# Create an abstraction which can be used across both pytorch and xgboost for 
# loading data.  The Pytorch model will be able to 
#-----
# https://stanford.edu/~shervine/blog/pytorch-how-to-generate-data-parallel
# https://pytorch.org/tutorials/beginner/basics/data_tutorial.html
class ModelLoader:
    source: ModelLoaderSource

    def __init__(self, source: ModelLoaderSource):
        self.source = source

    # read all data as one collection
    def read(self) -> ModelLoaderSource:
        return self.source
    
    # split the data into pages to be read across multiple threads, might not need, but putting it
    # here for now...
    def shard(self, pages: int) -> List[Self]:
        rtn = []
        window = math.ceil(len(self) / pages)

        for i in range(0, len(self), window):
            rtn.append(ModelLoader({
                'set1': self.source['set1'][i:i+window],
                'set2': self.source['set2'][i:i+window],
                'labels': self.source['labels'][i:i+window],
            }))

        return rtn
    
    # we will need to split data sets into training and validation sets
    def split(self, pivot: float) -> Tuple[Self, Self]:
        length = len(self)
        dexs = [i for i in range(0, length)]

        cut = math.ceil(length * pivot)
        random.shuffle(dexs)

        training = {
            'set1': [],
            'set2': [],
            'labels': [],
        }
        for dex in range(0, cut):
            pos = dexs[dex]
            training['set1'].append(self.source['set1'][pos])
            training['set2'].append(self.source['set2'][pos])
            training['labels'].append(self.source['labels'][pos])

        validation = {
            'set1': [],
            'set2': [],
            'labels': [],
        }
        for dex in range(0, cut):
            pos = dexs[dex]
            validation['set1'].append(self.source['set1'][pos])
            validation['set2'].append(self.source['set2'][pos])
            validation['labels'].append(self.source['labels'][pos])

        return (ModelLoader(training), ModelLoader(validation))
    
    def __len__(self):
        return len(self.source['labels'])
    
    def __getitem__(self, idx) -> ModelLoaderSet:
        return {
            'set1': self.source['set1'][idx],
            'set2': self.source['set2'][idx],
            'labels': self.source['labels'][idx],
        }
