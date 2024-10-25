import os
import pandas as pd
import pathlib

from .team import team_usage, team_selector_decode, team_sort_by_usage

from .common import fields as common_fields

from .selector import TeamSelector, TeamSelect



base_dir = str(pathlib.Path(__file__).parent.resolve())










def stats_season(
    selector: TeamSelector,
    players: list[str],
    include: bool = True,
    aggregate: bool = False,
) -> pd.DataFrame:
    return _stats_offense(team_selector_decode(selector), players, include, aggregate)
