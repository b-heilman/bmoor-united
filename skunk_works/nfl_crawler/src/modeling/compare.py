import pandas as pd
import statistics

from typing import Callable, Any

from .rating import player_ratings, player_rating_deltas, rating_off_compute
from .usage import player_usage, player_usage_deltas

from .common import each_comparison, player_roles, stat_fields

def compute_rating(role, off_df, def_df, off_delta_df, def_delta_df):
    return (
        (off_df.loc[role]["rating"]+def_df.loc[role]["rating"])/2
        + off_delta_df.loc[role]["rating"]
        + def_delta_df.loc[role]["rating"]
    )

def _compare_teams_by_rating(
    season: int, week: int, offense: str, defense: str
) -> pd.Series:
    off_df = (
        player_ratings.access_history(
            {"season": season, "week": week, "team": offense, "side": "off"}
        )
        .groupby(["role"])
        .agg({"rating": "mean"})
    )
    if len(off_df.index) == 0:
        raise Exception(f"Can not find: {offense}")

    off_delta_df = (
        player_rating_deltas.access_history(
            {"season": season, "week": week, "team": offense, "side": "off"}
        )
        .groupby(["role"])
        .agg({"rating": "mean"})
    )

    def_df = (
        player_ratings.access_history(
            {"season": season, "week": week, "team": defense, "side": "def"}
        )
        .groupby(["role"])
        .agg({"rating": "mean"})
    )
    if len(def_df.index) == 0:
        raise Exception(f"Can not find: {defense}")

    def_delta_df = (
        player_rating_deltas.access_history(
            {"season": season, "week": week, "team": defense, "side": "def"}
        )
        .groupby(["role"])
        .agg({"rating": "mean"})
    )

    return pd.Series(
        each_comparison(
            lambda agg: statistics.fmean(agg),
            lambda role, group, info: compute_rating(role, off_df, def_df, off_delta_df, def_delta_df)
        )
    )


def compare_teams_ratings(season: int, week: int, team1: str, team2: str) -> pd.DataFrame:
    return pd.DataFrame(
        [
            _compare_teams_by_rating(season, week, team1, team2),
            _compare_teams_by_rating(season, week, team2, team1),
        ]
    )


def compare_teams(
    season: int, week: int, team1: str, team2: str
) -> dict:
    ratings_df = compare_teams_ratings(season, week, team1, team2)

    ratings = ratings_df.iloc[0] - ratings_df.iloc[1]

    team1_points = 0
    team2_points = 0

    rtn = {
        'season': season,
        'week': week,
        'home': team1,
        'away': team2
    }

    for index, value in ratings.items():
        if abs(value) > 10000:
            print("--debug--", season, week, team1, team2)
            print(index, value)
            raise Exception("impossible rating")
    
        rtn[index] = value
        if value > 0:
            team1_points += 1
        else:
            team2_points += 1

    if team1_points > team2_points:
        team1_points += 1
        winner = team1
        loser = team2
    else:
        team2_points += 1
        winner = team1
        loser = team2

    rtn.update({
        "grade": team1_points - team2_points,
        "results": {"winner": winner, "loser": loser},
    })

    return rtn
