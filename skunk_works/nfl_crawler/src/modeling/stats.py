import os
import pandas as pd
import pathlib

from .team import team_usage, team_selector_decode, team_sort_by_usage

from .common import fields as common_fields

from .selector import (
    TeamSelector,
)

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


stats_fake_label = "--fake--"


# get_blank_stats
def stats_fake(count: int) -> pd.DataFrame:
    zeroed: dict[str, str | int] = {stat: 0 for stat in common_fields}
    zeroed["playerDisplay"] = stats_fake_label
    return pd.DataFrame([zeroed] * count)


# get_players_stats
def stats_players(selector: TeamSelector, players: list[str]) -> pd.DataFrame:
    base = team_selector_decode(selector)

    base = base[base["playerDisplay"].isin(players)]

    if len(base.index) == 0:
        return None

    rtn = (
        base.groupby("playerDisplay")
        .agg({stat: "mean" for stat in common_fields})
        .reindex(index=players)
        .reset_index()
    )

    return rtn


stats_rest_label = "rest"


# get_team_stats
def stats_team(selector: TeamSelector, ignore_players: list[str]) -> pd.Series:
    base = team_selector_decode(selector)

    rest_series = (
        base[~(base["playerDisplay"].isin(ignore_players))]
        .groupby("week")
        .agg({stat: "sum" for stat in common_fields})
        .mean()
    )

    rest_series["playerDisplay"] = stats_rest_label
    rest_series["role"] = "rest"

    return pd.DataFrame([rest_series])


# stats_offense
