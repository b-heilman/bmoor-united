import pandas as pd

from typing import Callable

from .rating import player_ratings, player_rating_deltas, rating_off_compute
from .usage import player_usage, player_usage_deltas

from .common import player_roles, stat_fields

def _compare_teams_by_rating(season: int, week: int, offense: str, defense: str) -> pd.Series:
    off_df = (
        player_ratings.access_history({
            'season': season,
            'week': week,
            'team': offense,
            'side': 'off'
        }).groupby(["role"])
        .agg({'rating': "mean"}).reset_index()
    )
    if len(off_df.index) == 0:
        raise Exception(f"Can not find: {offense}")

    off_delta_df = (
        player_rating_deltas.access_history({
            'season': season,
            'week': week,
            'team': offense,
            'side': 'off'
        }).groupby(["role"])
        .agg({'rating': "mean"}).reset_index()
    )

    def_df = (
        player_ratings.access_history({
            'season': season,
            'week': week,
            'team': defense,
            'side': 'def'
        }).groupby(["role"])
        .agg({'rating': "mean"}).reset_index()
    )
    if len(def_df.index) == 0:
        raise Exception(f"Can not find: {defense}")

    def_delta_df = (
        player_rating_deltas.access_history({
            'season': season,
            'week': week,
            'team': defense,
            'side': 'def'
        }).groupby(["role"])
        .agg({'rating': "mean"}).reset_index()
    )

    rtn = {
        role: off_df.loc[role]["rating"] + off_delta_df.loc[role]["rating"] \
            - def_df.loc[role]["rating"] + def_delta_df.loc[role]["rating"]
        for role in player_roles
    }
    rtn["rating"] = sum(rtn.values())
    rtn["team"] = offense

    return pd.Series(rtn)

def compare_teams_ratings(season: int, week: int, team1: str, team2: str):
    return pd.DataFrame([
        _compare_teams_by_rating(season, week, team1, team2), 
        _compare_teams_by_rating(season, week, team2, team1)
    ])
        

def _sanitize(series: pd.Series):
    """
    sometimes numbers become so small, they are causing overflow.  Anything less than
    .01, just make it 0
    """
    for i, value in series.items():
        if value < 0.01:
            series[i] = 0

    return series

def _compare_teams_by_usage(season: int, week: int, offense: str, defense: str) -> pd.DataFrame:
    off_df = player_usage.access_history({
        'season': season,
        'week': week,
        'team': offense,
        'side': 'off'
    }).groupby("role").agg({stat: "mean" for stat in stat_fields})

    off_delta_df = player_usage_deltas.access_history({
        'season': season,
        'week': week,
        'team': offense,
        'side': 'off'
    }).groupby("role").agg({stat: "mean" for stat in stat_fields})

    def_df = player_usage.access_history({
        'season': season,
        'week': week,
        'team': defense,
        'side': 'def'
    }).groupby("role").agg({stat: "mean" for stat in stat_fields})

    def_delta_df = player_usage_deltas.access_history({
        'season': season,
        'week': week,
        'team': defense,
        'side': 'def'
    }).groupby("role").agg({stat: "mean" for stat in stat_fields})

    rtn = pd.DataFrame([
        _sanitize(
            ((off_df.loc[role] + def_df.loc[role]) / 2) \
                + off_delta_df.loc[role] + def_delta_df.loc[role]
        ) for role in player_roles
    ])

    rtn['role'] = player_roles
    rtn["team"] = offense

    return rtn

def _reduce_team_usage(team_usage_df) -> pd.Series:
    df = team_usage_df.set_index('role')

    ratings = pd.DataFrame(rating_off_compute(df)).set_index('role')
    rtn = {
        role: ratings.loc[role]["rating"]
        for role in player_roles
    }
    rtn['rating'] = sum(rtn.values())

    return pd.Series(rtn)

def compare_teams_usage(season: int, week: int, team1: str, team2: str):
    team1_res = _compare_teams_by_usage(season, week, team1, team2)
    team1_rating = _reduce_team_usage(team1_res)
    team1_rating['team'] = team1

    team2_res = _compare_teams_by_usage(season, week, team2, team1)
    team2_rating = _reduce_team_usage(team2_res)
    team2_rating['team'] = team2

    return {
        'usage': pd.DataFrame([team1_res, team2_res]),
        'ratings': pd.concat([team1_rating, team2_rating])
    }


def compare_teams(season: int, week: int, team1: str, team2: str):
    ratings = compare_teams_ratings(season, week, team1, team2)
    usage = compare_teams_usage(season, week, team1, team2)
    stats = usage['ratings']

    team1_ratings = ratings.iloc[0]
    team2_ratings = ratings.iloc[1]
    team1_stats = stats.iloc[0]
    team2_stats = stats.iloc[1]

    team1_points = 0
    team2_points = 0

    if team1_ratings["rating"] > team2_ratings["rating"]:
        team1_points += 1
    else:
        team2_points += 1

    if team1_stats["rating"] > team2_stats["rating"]:
        team1_points += 1
    else:
        team2_points += 1

    if team1_stats["rating"] > team2_stats["rating"]:
        winner = team1_ratings
        loser = team2_ratings
    else:
        winner = team2_ratings
        loser = team1_ratings

    rating_value = team1_ratings["rating"] - team2_ratings["rating"]
    stat_value = team1_stats["rating"] - team2_stats["rating"]

    if abs(rating_value) > 10000:
        print('--debug--', season, week, team1, team2)
        print(team1_ratings)
        print(team2_ratings)
        raise Exception('impossible rating')
    
    if abs(stat_value) > 10000:
        print('--debug--', season, week, team1, team2)
        print(team1_stats)
        print(team2_stats)
        raise Exception('impossible stat')
    
    rtn = {
        "grade": team1_points - team2_points,
        "rating": rating_value,
        "stats": stat_value,
        "results": {
            "winner": winner["team"],
            "loser": loser["team"]
        }
    }

    return rtn, ratings, usage

