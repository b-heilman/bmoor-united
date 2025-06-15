from typing import Any, TypedDict, Generic, cast

from .base import Base
from ..context import Context
from ..orchestrator_interface import Encoded, Embedding


class ThresholdValues(TypedDict):
    classify: float
    distance: float
    similarity: float


class EvaluatorNotExtended(Exception):
    pass


class Evaluator(Base, Generic[Encoded]):
    def get_threshold_values(self) -> ThresholdValues:
        return {"classify": 0.0, "distance": 0.0, "similarity": 0.0}

    def get_supported(self) -> list:
        return ["classify", "distance", "similarity"]

    def classify(
        self, ctx: Context, embedding1: list[Embedding], embedding2: list[Embedding]
    ) -> list[float]:
        raise EvaluatorNotExtended("classify has not been defined")

    def distance(
        self, ctx: Context, embedding1: list[Embedding], embedding2: list[Embedding]
    ) -> list[float]:
        raise EvaluatorNotExtended("distance has not been defined")

    def similarity(
        self, ctx: Context, embedding1: list[Embedding], embedding2: list[Embedding]
    ) -> list[float]:
        raise EvaluatorNotExtended("similarity has not been defined")

    def classify_encoded(
        self, ctx: Context, processed1: list[Encoded], processed2: list[Encoded]
    ) -> list[float]:
        raise EvaluatorNotExtended("classify_encoded has not been defined")

    def distance_encoded(
        self, ctx: Context, processed1: list[Encoded], processed2: list[Encoded]
    ) -> list[float]:
        raise EvaluatorNotExtended("distance_encoded has not been defined")

    def similarity_encoded(
        self, ctx: Context, processed1: list[Encoded], processed2: list[Encoded]
    ) -> list[float]:
        raise EvaluatorNotExtended("similarity_encoded has not been defined")
