import pandas as pd
import statistics

from typing import Callable, Any

from .games import raw_games
from .rating import player_ratings, player_rating_deltas
from .usage import player_usage, player_usage_deltas

from .common import each_comparison, comparisons, stat_fields

def compute_usage(role, off_df, def_df, off_delta_df, def_delta_df):
    return (
        (off_df.loc[role][stat_fields]+def_df.loc[role][stat_fields])/2
        + off_delta_df.loc[role][stat_fields]
        + def_delta_df.loc[role][stat_fields]
    )

def _compare_teams_by_usage(
    season: int, week: int, offense: str, defense: str
) -> pd.Series:
    means = {stat: "mean" for stat in stat_fields}

    off_df = (
        player_usage.access_history(
            {"season": season, "week": week, "team": offense, "side": "off"}
        )
        .groupby(["role"])
        .agg(means)
    )
    if len(off_df.index) == 0:
        raise Exception(f"Can not find: {offense}")

    off_delta_df = (
        player_usage_deltas.access_history(
            {"season": season, "week": week, "team": offense, "side": "off"}
        )
        .groupby(["role"])
        .agg(means)
    )

    def_df = (
        player_usage.access_history(
            {"season": season, "week": week, "team": defense, "side": "def"}
        )
        .groupby(["role"])
        .agg(means)
    )
    if len(def_df.index) == 0:
        raise Exception(f"Can not find: {defense}")

    def_delta_df = (
        player_usage_deltas.access_history(
            {"season": season, "week": week, "team": defense, "side": "def"}
        )
        .groupby(["role"])
        .agg(means)
    )

    return pd.Series(
        each_comparison(
            lambda agg: pd.DataFrame(agg).mean(),
            lambda role, group, info: compute_usage(role, off_df, def_df, off_delta_df, def_delta_df)
        )
    )

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

def _build_training(season, week, home, away):
    return {
        'home_ratings': _compare_teams_by_rating(
            season, 
            week, 
            home, 
            away
        ),
        'away_ratings': _compare_teams_by_rating(
            season, 
            week, 
            away, 
            home
        ),
        'home_usages': _compare_teams_by_usage(
            season, 
            week, 
            home, 
            away
        ),
        'away_usages': _compare_teams_by_usage(
            season, 
            week, 
            away, 
            home
        )
    }

def build_training() -> dict:
    training = []
    for index, row in raw_games.get_frame().iterrows():
        try:
            if row["week"] > 2 and row["week"] < 16:
                season = row["season"]
                week = row["week"]
                search_week = week - 1
                home_team = row["homeTeamDisplay"]
                away_team = row["awayTeamDisplay"]

                print('training >', season, week, home_team, away_team)

                res = _build_training(
                    season, 
                    search_week, 
                    home_team, 
                    away_team
                )

                diff = row["homeScore"] - row["awayScore"]
                diff_norm = diff / 10 if abs(diff) < 10 else diff / abs(diff)
                expected = diff > 0
                home = {
                    'gameId': row['gameId'],
                    'team': home_team,
                    'home': True,
                    'expected': expected,
                    'diff': diff,
                    'diff_norm': diff_norm,
                    'diff_abs': abs(diff_norm),
                    '1-diff': 1-abs(diff_norm)
                }
                # Ideally, a game that goes to overtime would be 1
                away = {
                    'gameId': row['gameId'],
                    'team': away_team,
                    'home': False,
                    'expected': not expected,
                    'diff': -diff,
                    'diff_norm': -diff_norm,
                    'diff_abs': abs(diff_norm),
                    '1-diff': 1-abs(diff_norm)
                }

                for comparison in comparisons:
                    home_usage = res['home_usages'][comparison]
                
                    home.update(home_usage.rename(lambda heading: comparison+'_'+heading))
                    home.update({comparison+'_rating': res['home_ratings'][comparison]})

                    away_usage = res['away_usages'][comparison]
                
                    away.update(away_usage.rename(lambda heading: comparison+'_'+heading))
                    away.update({comparison+'_rating': res['away_ratings'][comparison]})

                training.append(home)
                training.append(away)
        except:
            pass

    return {
        'df': pd.DataFrame(training),
        'info': {
            'comparisons': comparisons,
            'fields': stat_fields,
            'ratings': ['rating'],
            'headers': [
                'gameId',
                'team',
                'home',
                'expected',
                'diff',
                'diff_norm',
                'diff_abs',
                '1-diff'
            ]
        }
    }

            
