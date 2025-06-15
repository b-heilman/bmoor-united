from typing import Generic, cast

from .base import Base
from ..context import Context
from ..orchestrator_interface import Raw, Parsed


class Parser(Base, Generic[Raw, Parsed]):
    def parse(
        self, ctx: Context, input: Raw
    ) -> list[Parsed]:
        # This is fine not to fail, just pass through
        return [cast(Parsed, input)]
