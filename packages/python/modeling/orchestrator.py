import os
import time
import random

from typing import cast, Generic, Callable, TypeVar, Union

from .config import Config
from .context import Context
from .component.parser import Parser
from .component.encoder import Encoder
from .component.embedder import Embedder
from .component.evaluator import Evaluator
from .component.base import Base
from .orchestrator_interface import (
    Raw,
    Parsed,
    Encoded,
    Embedded,
    Embedding,
    Encoding,
)
from ..logger import get_logger

log = get_logger(__name__)

Invoke = TypeVar("Invoke")


def _process(
    ctx: Context,
    processed_1: Union[Invoke, list[Invoke]],
    processed_2: Union[Invoke, list[Invoke]],
    callback: Callable[[Context, list[Invoke], list[Invoke]], list[float]],
) -> list[float]:
    is_list_1 = type(processed_1) is list and type(processed_1[0]) is list
    is_list_2 = type(processed_2) is list and type(processed_2[0]) is list

    if is_list_1 and is_list_2:
        arg_1 = cast(list[Invoke], processed_1)
        arg_2 = cast(list[Invoke], processed_2)
        l1 = len(arg_1)
        l2 = len(arg_2)

        if l1 != l2:
            raise Exception(f"if two lists, sizes must match > {l1}:{l2}")
    elif is_list_1 or is_list_2:
        if is_list_1:
            arg_1 = cast(list[Invoke], processed_1)
            arg_2 = cast(list[Invoke], [processed_2] * len(arg_1))
        else:
            arg_2 = cast(list[Invoke], processed_2)
            arg_1 = cast(list[Invoke], [processed_1] * len(arg_2))
    else:
        arg_1 = cast(list[Invoke], [processed_1])
        arg_2 = cast(list[Invoke], [processed_2])

    return callback(ctx, arg_1, arg_2)


class Orchestrator(Generic[Raw, Parsed, Encoded]):
    ctx: Config
    write_dir: str

    parser: Parser[Raw, Parsed]
    encoder: Encoder[Parsed, Encoded]
    embedder: Embedder[Encoded]
    evaluator: Evaluator

    loaded: dict[str, bool]

    def __init__(self, cfg: Config, write_dir="/tmp/orchestrator") -> None:
        self.cfg = cfg

        # Each component has a loader that actually loads in the important parts
        self.parser = Parser[Raw, Parsed](cfg, write_dir)
        self.encoder = Encoder[Parsed, Encoded](cfg, write_dir)
        self.embedder = Embedder[Encoded](cfg, write_dir)

        # compare embeddings
        self.evaluator = Evaluator(cfg, write_dir)
        self.write_dir = write_dir
        self.loaded = {}

        os.makedirs(write_dir, exist_ok=True)

    # I don't think I need this?
    # def clone(self, reference: Union[None, str] = None):
    #    return self.__class__(self.ctx.clone(reference), self.write_dir)

    def save(self, dir:Union[str, None] = None) -> None:
        if dir is None:
            dir = str(self.cfg.source_dir)

        self.parser.save(dir)
        self.encoder.save(dir)
        self.embedder.save(dir)
        self.evaluator.save(dir)

    # TODO: do I want to load a new instance based on ctx?
    def load(self, which: str) -> None:
        dir = self.cfg.source_dir

        attempt = 0

        if which not in self.loaded or not self.loaded[which]:
            tgt: Base = getattr(self, which)

            while attempt < 3:
                try:
                    log.info(f"orchestrator loading: {which}")
                    tgt.load(dir)
                    attempt = 4
                except:
                    time.sleep(random.uniform(0, 1))
                    log.info("trying to load again")
                    attempt += 1

            if attempt == 3:
                msg = "unable to load: " + which
                log.exception(msg)

                raise Exception(msg)

            self.loaded[which] = True

    def parse(self, ctx: Context, raw: Raw, **kwargs) -> list[Parsed]:
        self.load("parser")

        return self.parser.parse(ctx, raw, **kwargs)

    def encode(self, ctx: Context, parsed: Parsed, **kwargs) -> Encoded:
        self.load("encoder")

        return self.encoder.encode(ctx, parsed, **kwargs)

    def embed(self, ctx: Context, encoded: Encoded, **kwargs) -> Embedding:
        self.load("embedder")

        return self.embedder.embed(ctx, encoded, **kwargs)

    def classify(
        self, ctx: Context, embedding1: Embedding, embedding2: Embedding, **kwargs
    ) -> list[float]:
        self.load("evaluator")

        return _process( 
            ctx,
            embedding1,
            embedding2,
            lambda ctx, e1, e2: self.evaluator.classify(ctx, e1, e2, **kwargs),
        )

    def classify_encoded(
        self, ctx: Context, encoded1: Encoding, encoded2: Encoding, **kwargs
    ) -> list[float]:
        self.load("evaluator")

        return _process(
            ctx,
            encoded1,
            encoded2,
            lambda ctx, e1, e2: self.evaluator.classify_encoded(ctx, e1, e2, **kwargs),
        )

    def distance(
        self, ctx: Context, embedding1: Embedding, embedding2: Embedding, **kwargs
    ) -> list[float]:
        self.load("evaluator")

        return _process(  
            ctx,
            embedding1,
            embedding2,
            lambda ctx, e1, e2: self.evaluator.distance(ctx, e1, e2, **kwargs),
        )

    def distance_encoded(
        self, ctx: Context, encoded1: Encoding, encoded2: Encoding, **kwargs
    ) -> list[float]:
        self.load("evaluator")

        return _process(
            ctx,
            encoded1,
            encoded2,
            lambda ctx, e1, e2: self.evaluator.distance_encoded(ctx, e1, e2, **kwargs),
        )

    def similarity(
        self, ctx: Context, embedding1: Embedding, embedding2: Embedding, **kwargs
    ) -> list[float]:
        self.load("evaluator")

        return _process(  # type: ignore
            ctx,
            embedding1,
            embedding2,
            lambda ctx, e1, e2: self.evaluator.similarity(ctx, e1, e2, **kwargs),
        )

    def similarity_encoded(
        self, ctx: Context, encoded1: Encoding, encoded2: Encoding, **kwargs
    ) -> list[float]:
        self.load("evaluator")

        return _process( # type: ignore
            ctx,
            encoded1,
            encoded2,
            lambda ctx, e1, e2: self.evaluator.similarity_encoded(ctx, e1, e2, **kwargs),
        )
