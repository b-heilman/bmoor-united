from ..config import Config


class Base:
    cfg: Config
    cache_dir: str

    def __init__(self, cfg: Config, cache_dir: str = '/tmp') -> None:
        super().__init__()

        self.cfg = cfg
        self.cache_dir = cache_dir

    def save(self, dir: str='/tmp') -> None:
        pass

    def load(self, dir: str='/tmp') -> None:
        pass
