import os
import pandas as pd
import pathlib

from .team import team_usage, team_selector_decode, team_sort_by_usage

from .common import fields as common_fields

from .selector import (
    TeamSelector,
)

stats_fake_display = "--fake--"
stats_rest_display = "aggregate"

base_dir = str(pathlib.Path(__file__).parent.resolve())

def stats_sort_recievers(selector: TeamSelector, week: int, count=3) -> list[str]:
    """
    Return back embeddings representing receivers
    """
    # reduce only to available players
    reduced_df = team_usage(selector, week, gt="recAtt", lt="rushAtt")
    
    return list(
        team_sort_by_usage(
            reduced_df, week, count, sort_field="recAtt", rtn_field="playerDisplay"
        ).keys()
    )


def stats_sort_rushers(selector: TeamSelector, week: int, count=2) -> list[str]:
    """
    Return back embeddings representing rushers
    """
    reduced_df = team_usage(selector, week, gt="rushAtt", lt="recAtt")

    return list(
        team_sort_by_usage(
            reduced_df, week, count, sort_field="rushAtt", rtn_field="playerDisplay"
        ).keys()
    )


def stats_sort_quarterback(selector: TeamSelector, week: int, count=1) -> list[str]:
    """
    Return back embeddings representing starting qb
    """
    reduced_df = team_usage(
        selector, week, gt="passAtt", lt="rushAtt", ignore_values=["wr", "rb"]
    )

    return list(
        team_sort_by_usage(
            reduced_df, week, count, sort_field="passAtt", rtn_field="playerDisplay"
        ).keys()
    )

# get_blank_stats
def stats_fake(count: int) -> pd.DataFrame:
    zeroed: dict[str, str | int] = {stat: 0 for stat in common_fields}
    zeroed["playerDisplay"] = stats_fake_display

    return pd.DataFrame([zeroed] * count)

# get_players_stats
def stats_players(
    selector: TeamSelector, 
    players: list[str],
    include: bool = True,
    aggregate: bool = False
) -> pd.DataFrame:
    base = team_selector_decode(selector)

    if include:
        base = base[base["playerDisplay"].isin(players)]
    else:
        base = base[~base["playerDisplay"].isin(players)]

    if len(base.index) == 0:
        return pd.DataFrame()

    if aggregate:
        rtn_series = (
            base
            .groupby("week")
            .agg({stat: "sum" for stat in common_fields})
            .mean()
        )

        rtn = pd.DataFrame([rtn_series])
        rtn['playerDisplay'] = stats_rest_display

        return rtn.set_index('playerDisplay').reset_index()
    else:
        rtn = (
            base.groupby("playerDisplay")
            .agg({stat: "mean" for stat in common_fields})
        )
        
        if include:
            return rtn.reindex(index=players).reset_index()
        else:
            return rtn.reindex(index=base['playerDisplay'].unique()).reset_index()
