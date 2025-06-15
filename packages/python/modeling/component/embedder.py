from typing import Generic, cast

from .base import Base
from ..context import Context
from ..orchestrator_interface import Parsed, Embedding


class EmbedderNotExtended(Exception):
    pass


class Embedder(Base, Generic[Parsed]):
    def embed(self, ctx: Context, processed: Parsed) -> Embedding:
        raise EmbedderNotExtended("embed was not defined")
