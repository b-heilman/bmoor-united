from typing import TypeVar, Union
from numpy import ndarray

Raw = TypeVar("Raw")
Parsed = TypeVar("Parsed")
Encoded = TypeVar("Encoded")

Embedded = ndarray

Embedding = Union[Embedded, list[Embedded]]
Encoding = Union[Encoded, list[Encoded]]
