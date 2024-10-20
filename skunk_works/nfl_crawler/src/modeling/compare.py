import pandas as pd

from typing import Callable

from .schedule import schedule_next_week
from .display import display_analysis
from .offense import offense_role_get_df
from .delta import delta_offense_get_df, delta_defense_get_df
from .rating import rating_get_df, rating_off_compute

from .team import team_alias

from .common import roles as stats_roles, fields as stats_fields


def _compare_week(season, week, fn: Callable[[int, int, str, str], pd.DataFrame]):
    return pd.concat(
        [
            fn(season, week, game["home"], game["away"])
            for game in schedule_next_week()["games"]
        ]
    )


def _compare_teams_rating(team1_df, team2_df):
    off_df = team1_df[team1_df["side"] == "off"].reset_index().set_index("role")
    def_df = team2_df[team2_df["side"] == "def"].reset_index().set_index("role")

    return {
        role: off_df.loc[role]["rating"] + def_df.loc[role]["rating"]
        for role in stats_roles
    }


def compare_teams_rating(season: int, week: int, team1: str, team2: str):
    rating_df = rating_get_df()

    team1_alias = team_alias[team1] if team1 in team_alias else team1
    team2_alias = team_alias[team2] if team2 in team_alias else team2

    team1_df = (
        rating_df[
            (rating_df["season"] == season) & 
            (rating_df["week"] <= week) & 
            (rating_df["team"] == team1_alias)
        ].groupby(["side", "role"])
        .agg({'rating': "mean"}).reset_index()
    )

    if len(team1_df.index) == 0:
        raise Exception(f"Can not find: {team1} > {team1_alias}")

    team2_df = (
        rating_df[
            (rating_df["season"] == season) & 
            (rating_df["week"] <= week) & 
            (rating_df["team"] == team2_alias)
        ].groupby(["side", "role"])
        .agg({'rating': "mean"}).reset_index()
    )

    if len(team2_df.index) == 0:
        raise Exception(f"Can not find: {team2} > {team2_alias}")

    team1_res = _compare_teams_rating(team1_df, team2_df)
    team1_res["rating"] = sum(team1_res.values())
    team1_res["team"] = team1
    team1_df['team'] = team1

    team2_res = _compare_teams_rating(team2_df, team1_df)
    team2_res["rating"] = sum(team2_res.values())
    team2_res["team"] = team2
    team2_df['team'] = team2

    return {
        'teams': pd.DataFrame([team1_res, team2_res]),
        'roles': pd.concat([team1_df, team2_df])
    }

def _sanitize(series: pd.Series):
    """
    sometimes numbers become so small, they are causing overflow.  Anything less than
    .01, just make it 0
    """
    for i, value in series.items():
        if value < 0.01:
            series[i] = 0

    return series

def compare_teams_stats(season: int, week: int, team1: str, team2: str):
    off_df = offense_role_get_df()
    off_delta_df = delta_offense_get_df()
    def_delta_df = delta_defense_get_df()

    team1_alias = team_alias[team1] if team1 in team_alias else team1
    team2_alias = team_alias[team2] if team2 in team_alias else team2

    team1_off = off_df[
        (off_df['season'] == season) &
        (off_df['week'] <= week) &
        (off_df['team'] == team1_alias)
    ].groupby("role").agg({stat: "mean" for stat in stats_fields})

    team2_off = off_df[
        (off_df['season'] == season) &
        (off_df['week'] <= week) &
        (off_df['team'] == team2_alias)
    ].groupby("role").agg({stat: "mean" for stat in stats_fields})

    team1_off_delta = off_delta_df[
        (off_delta_df['season'] == season) &
        (off_delta_df['week'] <= week) &
        (off_delta_df['team'] == team1_alias)
    ].groupby("role").agg({stat: "mean" for stat in stats_fields})

    team2_off_delta = off_delta_df[
        (off_delta_df['season'] == season) &
        (off_delta_df['week'] <= week) &
        (off_delta_df['team'] == team2_alias)
    ].groupby("role").agg({stat: "mean" for stat in stats_fields})

    team1_def_delta = def_delta_df[
        (off_delta_df['season'] == season) &
        (off_delta_df['week'] <= week) &
        (off_delta_df['team'] == team1_alias)
    ].groupby("role").agg({stat: "mean" for stat in stats_fields})

    team2_def_delta = def_delta_df[
        (off_delta_df['season'] == season) &
        (off_delta_df['week'] <= week) &
        (off_delta_df['team'] == team2_alias)
    ].groupby("role").agg({stat: "mean" for stat in stats_fields})

    #print('--wr3:offense--')
    #print(pd.DataFrame([
    #    team1_off.loc['rb1'],
    #    team2_def_delta.loc['rb1'],
    #    team1_off_delta.loc['rb1']
    #]))
    #print('--sanity--')
    #print(pd.DataFrame([
    #    team1_off.loc['rb1'] - team2_def_delta.loc['rb1'],
    #    team1_off.loc['rb1'] + team1_off_delta.loc['rb1'],
    #    team1_off.loc['rb1'] + team1_off_delta.loc['rb1'] - team2_def_delta.loc['rb1']
    #]))

    team1_expectation_df = pd.DataFrame([
        _sanitize(
            team1_off.loc[role] + team1_off_delta.loc[role] - team2_def_delta.loc[role]
        ) for role in stats_roles
    ])
    #print('--expectations--')
    #print(team1_expectation_df)
    team1_expectation_df['role'] = stats_roles
    team1_expectation_df["team"] = team1
    team1_ratings = pd.DataFrame(rating_off_compute(team1_expectation_df)).set_index('role')
    team1_res = {
        role: team1_ratings.loc[role]["rating"]
        for role in stats_roles
    }
    team1_res['rating'] = sum(team1_res.values())
    team1_res["team"] = team1

    team2_expectation_df = pd.DataFrame([
        _sanitize(
            team2_off.loc[role] + team2_off_delta.loc[role] - team1_def_delta.loc[role]
        ) for role in stats_roles
    ])
    team2_expectation_df['role'] = stats_roles
    team2_expectation_df["team"] = team2
    team2_ratings = pd.DataFrame(rating_off_compute(team2_expectation_df)).set_index('role')
    team2_res = {
        role: team2_ratings.loc[role]["rating"]
        for role in stats_roles
    }
    team2_res['rating'] = sum(team2_res.values())
    team2_res["team"] = team2

    return {
        'teams': pd.DataFrame([team1_res, team2_res]),
        'roles': pd.concat([team1_expectation_df, team2_expectation_df])
    }


def compare_teams(season: int, week: int, team1: str, team2: str):
    ratings = compare_teams_rating(season, week, team1, team2)['teams']
    stats = compare_teams_stats(season, week, team1, team2)['teams']

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

    return rtn, ratings, stats


def compare_week(season, week):
    comparisions = _compare_week(season, week, compare_teams)

    print('---games---')
    print(comparisions)
    display_analysis(
        {
            "--qb1--": comparisions.sort_values(by=["qb1"], ascending=False),
            "--rb1--": comparisions.sort_values(by=["rb1"], ascending=False),
            "--rb2--": comparisions.sort_values(by=["rb2"], ascending=False),
            "--wr1--": comparisions.sort_values(by=["wr1"], ascending=False),
            "--wr2--": comparisions.sort_values(by=["wr2"], ascending=False),
            "--wr3--": comparisions.sort_values(by=["wr3"], ascending=False),
        },
        head=3,
    )
