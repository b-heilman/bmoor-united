import os
import pandas as pd
import pathlib

from .offense import offense_compute

from .common import fields as common_fields

from .common import roles as stats_roles

from .stats import stats_players, stats_team, stats_rest_label, stats_fake_label

from .team import (
    team_selector_decode,
)

from .opponent import opponent_schedule, opponent_history

from .selector import TeamSelect

base_dir = str(pathlib.Path(__file__).parent.resolve())

defense_df = None
def_parquet_path = os.path.abspath(base_dir + "/../../cache/parquet/defense.parquet")


def defense_get_df() -> pd.DataFrame:
    global defense_df

    if defense_df is None:
        if os.path.exists(def_parquet_path):
            defense_df = pd.read_parquet(def_parquet_path)
        else:
            defense_df = pd.DataFrame()

    return defense_df


def defense_add_df(add_df):
    global defense_df

    defense_df = pd.concat([defense_df, add_df])


def defense_save_df():
    global defense_df

    defense_df.reset_index(inplace=True, drop=True)

    defense_df.to_parquet(def_parquet_path)


def _compute_early_def_stats(selector: TeamSelect) -> pd.DataFrame:
    # if we are in week one, so we don't have priors, instead we will use
    # the league average for the role

    # get my opponent for the week
    schedule = opponent_schedule(selector)
    this_week = schedule.pop(0)

    # current_df = get_week_stats(season, week, this_week['opponent'])
    advanced_df = offense_compute(
        {
            "season": selector["season"],
            "week": selector["week"],
            "team": this_week["opponent"],
        }
    )

    teams = opponent_history(selector)["teamDisplay"].unique()

    advanced_aggs = [
        offense_compute(
            {"season": selector["season"], "week": selector["season"], "team": team}
        )
        for team in teams
    ]

    others_df = (
        pd.concat(advanced_aggs)
        .groupby("role")
        .agg({stat: "mean" for stat in common_fields})
    )

    res = []
    for role in stats_roles:
        others_results = pd.DataFrame([others_df.loc[role]])
        advanced_results = advanced_df.loc[advanced_df["role"] == role]

        diff = (
            pd.concat([others_results[common_fields], advanced_results[common_fields]])
            .diff()
            .iloc[1]
        )

        diff["playerDisplay"] = advanced_results.iloc[0]["playerDisplay"]
        diff["role"] = role

        res.append(diff)

    return pd.DataFrame(res)


def _compute_later_def_stats(selector: TeamSelect) -> pd.DataFrame:
    # get my opponent for the last week
    schedule = opponent_schedule(selector)
    this_week = schedule.pop(0)
    opponent = this_week["opponent"]

    opponent_df = team_selector_decode(
        {"season": selector["season"], "week": selector["week"], "team": opponent}
    )

    opponent_current_df = opponent_df[opponent_df["week"] == selector["week"]]
    opponent_history_df = opponent_df[opponent_df["week"] < selector["week"]]

    # get the advanced_off stats for my opponent average stats for last week
    opponent_roles = offense_compute(
        {"season": selector["season"], "week": selector["week"], "team": opponent}
    )[["playerDisplay", "role", "playerPosition"]].copy()
    opponent_roles.reset_index(inplace=True)

    # remove fills
    fake_index = opponent_roles[
        opponent_roles["playerDisplay"] == stats_fake_label
    ].index
    opponent_roles.drop(fake_index, inplace=True)

    # remove rest from results
    rest_index = opponent_roles[
        opponent_roles["playerDisplay"] == stats_rest_label
    ].index
    opponent_roles.drop(rest_index, inplace=True)

    # compute how much I changed from their average
    res = []
    for index, row in opponent_roles.iterrows():
        player = row["playerDisplay"]
        prior_results = stats_players(opponent_history_df, [player])
        current_results = opponent_current_df.loc[
            opponent_current_df["playerDisplay"] == player
        ]

        if prior_results is None:
            sub_team_season_df = opponent_history_df[
                opponent_history_df["playerPosition"] == row["playerPosition"]
            ]
            prior_results = stats_team(
                sub_team_season_df, opponent_roles["playerDisplay"]
            )

        diff = (
            pd.concat([prior_results[common_fields], current_results[common_fields]])
            .diff()
            .iloc[1]
        )

        diff["playerDisplay"] = player
        diff["role"] = row["role"]

        res.append(diff)

    # compute the rest
    prior_results = stats_team(opponent_history_df, opponent_roles["playerDisplay"])
    current_results = stats_team(opponent_current_df, opponent_roles["playerDisplay"])

    diff = (
        pd.concat([prior_results[common_fields], current_results[common_fields]])
        .diff()
        .iloc[1]
    )

    diff["playerDisplay"] = stats_rest_label
    diff["role"] = "rest"

    res.append(diff)

    return pd.DataFrame(res)


def defense_compute(selector: TeamSelect) -> pd.DataFrame:
    """
    I want to calculate the effects we have for each abstraction position
    """
    season = selector["season"]
    week = selector["week"]
    team = selector["team"]

    defensive_df = defense_get_df()

    if len(defensive_df.index) > 0:
        res_df = defensive_df[
            (defensive_df["season"] == season)
            & (defensive_df["week"] == week)
            & (defensive_df["team"] == team)
        ]

        if len(res_df.index) != 0:
            return res_df

    if week == 1:
        res_df = _compute_early_def_stats(selector)
    else:
        res_df = _compute_later_def_stats(selector)

    res_df["season"] = season
    res_df["week"] = week
    res_df["team"] = team

    # save data
    defense_add_df(res_df)

    return res_df


def defense_history(selector: TeamSelect):
    defensive_df = defense_get_df()

    # TODO: I should make sure all the weeks have been loaded
    return defensive_df[
        (defensive_df["season"] == selector["season"])
        & (defensive_df["week"] <= selector["week"])
        & (defensive_df["team"] == selector["team"])
    ]
