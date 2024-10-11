import pandas as pd

from typing import Callable

from .schedule import schedule_next_week
from .display import display_analysis

from .rating import rating_get_df

from .team import team_alias

from .common import roles as stats_roles


def compare_week(season, week, fn: Callable[[int, int, str, str], pd.DataFrame]):
    return pd.concat(
        [
            fn(season, week, game["home"], game["away"])
            for game in schedule_next_week()["games"]
        ]
    )


def _compare_teams(team1_df, team2_df):
    off_df = team1_df[team1_df["side"] == "off"].reset_index().set_index("role")
    def_df = team2_df[team2_df["side"] == "def"].reset_index().set_index("role")

    return {
        role: off_df.loc[role]["rating"] - def_df.loc[role]["rating"]
        for role in stats_roles
    }


def compare_teams(season: int, week: int, team1: str, team2: str, show_vs=False):
    rating_df = rating_get_df()

    team1_alias = team_alias[team1] if team1 in team_alias else team1
    team2_alias = team_alias[team2] if team2 in team_alias else team2

    week_df = rating_df[(rating_df["season"] == season) & (rating_df["week"] == week)]

    team1_df = week_df[week_df["team"] == team1_alias]
    if len(team1_df.index) == 0:
        raise Exception(f"Can not find: {team1} > {team1_alias}")

    team2_df = week_df[week_df["team"] == team2_alias]
    if len(team2_df.index) == 0:
        raise Exception(f"Can not find: {team2} > {team2_alias}")

    team1_res = _compare_teams(team1_df, team2_df)
    team1_res["rating"] = sum(team1_res.values())
    team1_res["team"] = team1
    if show_vs:
        team1_res["vs"] = team2

    team2_res = _compare_teams(team2_df, team1_df)
    team2_res["rating"] = sum(team2_res.values())
    team2_res["team"] = team2
    if show_vs:
        team2_res["vs"] = team1

    return pd.DataFrame([team1_res, team2_res])


def compare_teams_rating(season: int, week: int, team1: str, team2: str):
    res = compare_teams(season, week, team1, team2)

    team1_res = res.iloc[0]
    team2_res = res.iloc[1]

    if team1_res["rating"] > team2_res["rating"]:
        winner = team1_res
        loser = team2_res
    else:
        winner = team2_res
        loser = team1_res

    rtn = {
        "winner": winner["team"],
        "loser": loser["team"],
        "home": team1_res["team"],
        "away": team2_res["team"],
        "diff": winner["rating"] - loser["rating"],
    }

    return rtn, res


def compute_week(season, week):
    comparisions = compare_week(season, week, compare_teams)

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
