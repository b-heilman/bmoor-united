from numpy import ndarray
from typing import TypeVar, Union


Raw = TypeVar("Raw")
Parsed = TypeVar("Parsed")
Encoded = TypeVar("Encoded")

Embedding = ndarray

Embedded = Union[Embedding, list[Embedding]]
Encoding = Union[Encoded, list[Encoded]]
