import os
import pandas as pd
import pathlib

from .offense import (
    offense_role_compute,
    offense_selector_across,
    offense_selector_decode,
)

from .defense import (
    defense_role_compute,
    defense_selector_across,
    defense_selector_decode,
)

from .common import fields as stats_fields, roles as stats_roles

from .opponent import opponent_schedule

from .selector import TeamSelect, WeekSelect

base_dir = str(pathlib.Path(__file__).parent.resolve())

delta_offense_df = None
delta_offense_parquet_path = os.path.abspath(
    base_dir + "/../../cache/parquet/delta_offense.parquet"
)


# get_offense_df
def delta_offense_get_df() -> pd.DataFrame:
    global delta_offense_df

    if delta_offense_df is None:
        if os.path.exists(delta_offense_parquet_path):
            delta_offense_df = pd.read_parquet(delta_offense_parquet_path)
        else:
            delta_offense_df = pd.DataFrame()

    return delta_offense_df


# add_offense_df
def delta_offense_add_df(add_df):
    global delta_offense_df

    delta_offense_df = pd.concat([delta_offense_df, add_df])


# save_offense_df
def delta_offense_save_df():
    global delta_offense_df

    delta_offense_df.reset_index(inplace=True, drop=True)

    delta_offense_df.to_parquet(delta_offense_parquet_path)


def delta_offense_compute(selector: TeamSelect) -> pd.DataFrame:
    """
    For every week, calculate the top players by position by attempt
    """
    off_delta_df = delta_offense_get_df()

    if len(off_delta_df.index) > 0:
        res_df = off_delta_df[
            (off_delta_df["season"] == selector["season"])
            & (off_delta_df["week"] == selector["week"])
            & (off_delta_df["team"] == selector["team"])
        ]

        if len(res_df.index) != 0:
            return res_df

    # get this week
    this_week_df = defense_role_compute(selector).set_index("role")[
        [stat for stat in stats_fields]
    ]

    # get the historical average
    if selector["week"] == 1:
        # if we're on week one, we will compare to everyone else
        history_df = (
            defense_selector_across(
                {
                    "season": selector["season"],
                    "week": selector["week"],
                }
            )
            .groupby("role")
            .agg({stat: "mean" for stat in stats_fields})
        )
    else:
        history_df = (
            defense_selector_decode(
                {
                    "season": selector["season"],
                    "week": selector["week"] - 1,
                    "team": selector["team"],
                }
            )
            .groupby("role")
            .agg({stat: "mean" for stat in stats_fields})
        )

    # compute the change off of the average for the role
    delta_df = pd.DataFrame(
        [this_week_df.loc[role] - history_df.loc[role] for role in stats_roles]
    )

    delta_df["role"] = stats_roles
    delta_df["season"] = selector["season"]
    delta_df["week"] = selector["week"]
    delta_df["team"] = selector["team"]

    delta_offense_add_df(delta_df)

    return delta_df


delta_defense_df = None
delta_defense_parquet_path = os.path.abspath(
    base_dir + "/../../cache/parquet/delta_defense.parquet"
)


# get_offense_df
def delta_defense_get_df() -> pd.DataFrame:
    global delta_defense_df

    if delta_defense_df is None:
        if os.path.exists(delta_defense_parquet_path):
            delta_defense_df = pd.read_parquet(delta_defense_parquet_path)
        else:
            delta_defense_df = pd.DataFrame()

    return delta_defense_df


# add_offense_df
def delta_defense_add_df(add_df):
    global delta_defense_df

    delta_defense_df = pd.concat([delta_defense_df, add_df])


# save_offense_df
def delta_defense_save_df():
    global delta_defense_df

    delta_defense_df.reset_index(inplace=True, drop=True)

    delta_defense_df.to_parquet(delta_defense_parquet_path)


def delta_defense_compute(selector: TeamSelect) -> pd.DataFrame:
    """
    For every week, calculate the top players by position by attempt
    """
    off_delta_df = delta_defense_get_df()

    if len(off_delta_df.index) > 0:
        res_df = off_delta_df[
            (off_delta_df["season"] == selector["season"])
            & (off_delta_df["week"] == selector["week"])
            & (off_delta_df["team"] == selector["team"])
        ]

        if len(res_df.index) != 0:
            return res_df

    schedule = opponent_schedule(selector)
    this_week = schedule.pop(0)
    opponent = this_week["opponent"]

    # get this week
    this_week_df = offense_role_compute(
        {"season": selector["season"], "week": selector["week"], "team": opponent}
    ).set_index("role")[[stat for stat in stats_fields]]

    # get the historical average
    if selector["week"] == 1:
        # if we're on week one, we will compare to everyone else
        history_df = (
            offense_selector_across(
                {
                    "season": selector["season"],
                    "week": selector["week"],
                }
            )
            .groupby("role")
            .agg({stat: "mean" for stat in stats_fields})
        )
    else:
        history_df = (
            offense_selector_decode(
                {
                    "season": selector["season"],
                    "week": selector["week"] - 1,
                    "team": opponent,
                }
            )
            .groupby("role")
            .agg({stat: "mean" for stat in stats_fields})
        )

    # compute the change off of the average for the role
    delta_df = pd.DataFrame(
        [this_week_df.loc[role] - history_df.loc[role] for role in stats_roles]
    )

    delta_df["role"] = stats_roles
    delta_df["season"] = selector["season"]
    delta_df["week"] = selector["week"]
    delta_df["team"] = selector["team"]

    delta_defense_add_df(delta_df)

    return delta_df
