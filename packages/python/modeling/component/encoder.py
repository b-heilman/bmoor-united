from typing import Generic, cast

from .base import Base
from ..context import Context
from ..orchestrator_interface import Parsed, Encoded


class Encoder(Base, Generic[Parsed, Encoded]):
    def encode(self, ctx: Context, input: Parsed) -> Encoded:
        return cast(Encoded, input)
