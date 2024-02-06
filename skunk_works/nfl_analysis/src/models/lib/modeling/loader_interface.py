import sys

if sys.version_info >= (3, 8):
    from typing import TypedDict
else:
    from typing_extensions import TypedDict

from typing import List

Features = List[float]
Labels = List[int]

class ModelLoaderSource(TypedDict):
    set1: List[Features]
    set2: List[Features]
    labels: List[Labels]