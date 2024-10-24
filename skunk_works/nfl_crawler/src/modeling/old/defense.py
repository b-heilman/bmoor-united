import os
import pandas as pd
import pathlib

from .offense import (
    offense_role_compute,
    offense_selector_across,
    offense_selector_decode,
)

from .common import fields as stats_fields, roles as stats_roles

from .stats import stats_week, stats_season

from .team import team_selector_decode, team_alias

from .opponent import opponent_schedule, opponent_history

from .selector import TeamSelect, WeekSelect

base_dir = str(pathlib.Path(__file__).parent.resolve())

defense_role_df = None
def_role_parquet_path = os.path.abspath(
    base_dir + "/../../cache/parquet/defense_role.parquet"
)


def defense_role_get_df() -> pd.DataFrame:
    global defense_role_df

    if defense_role_df is None:
        if os.path.exists(def_role_parquet_path):
            defense_role_df = pd.read_parquet(def_role_parquet_path)
        else:
            defense_role_df = pd.DataFrame()

    return defense_role_df


def defense_role_add_df(add_df):
    global defense_role_df

    defense_role_df = pd.concat([defense_role_df, add_df])


def defense_role_save_df():
    global defense_role_df

    defense_role_df.reset_index(inplace=True, drop=True)

    defense_role_df.to_parquet(def_role_parquet_path)


def _compute_early_def_role(selector: TeamSelect) -> pd.DataFrame:
    # if we are in week one, so we don't have priors, instead we will use
    # the league average for the role

    # get my opponent for the week
    schedule = opponent_schedule(selector)
    this_week = schedule.pop(0)

    # current_df = get_week_stats(season, week, this_week['opponent'])
    opponent_roles_df = offense_role_compute(
        {
            "season": selector["season"],
            "week": selector["week"],
            "team": this_week["opponent"],
        }
    )

    teams = opponent_history(selector)["teamDisplay"].unique()

    advanced_aggs = [
        offense_role_compute(
            {"season": selector["season"], "week": selector["week"], "team": team}
        )
        for team in teams
    ]

    others_df = (
        pd.concat(advanced_aggs)
        .groupby("role")
        .agg({stat: "mean" for stat in stats_fields})
    )

    res = []
    for role in stats_roles:
        others_results = pd.DataFrame([others_df.loc[role]])
        advanced_results = opponent_roles_df.loc[opponent_roles_df["role"] == role]

        diff = (
            pd.concat([others_results[stats_fields], advanced_results[stats_fields]])
            .diff()
            .iloc[1]
        )

        diff["playerDisplay"] = advanced_results.iloc[0]["playerDisplay"]
        diff["role"] = role

        res.append(diff)

    return pd.DataFrame(res)


def _defense_role_players(
    selector: TeamSelect,
    role,  # row["playerDisplay"], row["role"]
    current_df: pd.DataFrame,
    history_df: pd.DataFrame,
    players: list[str],
):
    # Get the players current and prior stats
    current_results = stats_week(current_df, players, include=True, aggregate=True)

    prior_results = stats_season(history_df, players, include=True, aggregate=True)

    # If there are no priors, we need to fail back
    if len(prior_results.index) == 0:
        teams = opponent_history(selector)["teamDisplay"].unique()

        advanced_aggs = [
            offense_role_compute(
                {"season": selector["season"], "week": selector["week"], "team": team}
            )
            for team in teams
        ]

        others_df = (
            pd.concat(advanced_aggs)
            .groupby("role")
            .agg({stat: "mean" for stat in stats_fields})
        )

        # This will be the average for everyone in the same role across the leage
        # if the player doesn't have a history
        prior_results = pd.DataFrame([others_df.loc[role]])

    return (
        pd.concat([prior_results[stats_fields], current_results[stats_fields]])
        .diff()
        .iloc[1]
    )


def _defense_role_compute(selector: TeamSelect) -> pd.DataFrame:
    # get my opponent for the last week
    schedule = opponent_schedule(selector)
    this_week = schedule.pop(0)
    opponent = this_week["opponent"]

    # get the advanced_off stats for my opponent average stats for last week
    opponent_roles = offense_role_compute(
        {"season": selector["season"], "week": selector["week"], "team": opponent}
    )[["role", "playerDisplay", "playerPosition"]].copy()

    opponent_roles["team"] = selector["team"]

    return opponent_roles


# these are the stats for the defense they have given up that week to those roles
def defense_role_compute(selector: TeamSelect) -> pd.DataFrame:
    """
    I want to calculate the effects we have for each abstraction position
    """
    season = selector["season"]
    week = selector["week"]
    team = selector["team"]

    defensive_df = defense_role_get_df()

    if len(defensive_df.index) > 0:
        res_df = defensive_df[
            (defensive_df["season"] == season)
            & (defensive_df["week"] == week)
            & (defensive_df["team"] == team)
        ]

        if len(res_df.index) != 0:
            return res_df

    # games can get cancelled.  so make sure stats exist for this week.  If they
    # they don't, call one week ago
    df = team_selector_decode(selector)
    if len(df[df["week"] == week].index) == 0:
        if week > 1:
            return defense_role_compute(
                {
                    "season": selector["season"],
                    "week": df["week"].max(),
                    "team": selector["team"],
                }
            )

    # figure out the opponent for this week, make that your stats
    schedule = opponent_schedule(selector)
    this_week = schedule.pop(0)
    opponent = this_week["opponent"]

    # get the advanced_off stats for my opponent average stats for last week
    res_df = offense_role_compute(
        {"season": selector["season"], "week": selector["week"], "team": opponent}
    ).copy()

    res_df["season"] = season
    res_df["week"] = week
    res_df["team"] = team

    # save data
    defense_role_add_df(res_df)

    return res_df


def defense_selector_across(selector: WeekSelect) -> pd.DataFrame:
    return pd.concat(
        [
            defense_role_compute(
                {"season": selector["season"], "week": selector["week"], "team": team}
            )
            for team in team_alias.values()
        ]
    )


def defense_selector_decode(selector: TeamSelect):
    return pd.concat(
        [
            defense_role_compute(
                {"season": selector["season"], "week": w, "team": selector["team"]}
            )
            for w in range(selector["week"], 0, -1)
        ]
    )
