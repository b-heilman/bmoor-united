import os
import pandas as pd
import pathlib

from .common import roles as stats_roles

from .stats import (
    stats_sort_recievers,
    stats_sort_rushers,
    stats_sort_quarterback,
    stats_week,
    stats_fake,
)

from .team import team_selector_decode

from .selector import TeamSelector, TeamSelect

base_dir = str(pathlib.Path(__file__).parent.resolve())

offense_df = None
offense_parquet_path = os.path.abspath(
    base_dir + "/../../cache/parquet/offense_role.parquet"
)


# get_offense_df
def offense_role_get_df() -> pd.DataFrame:
    global offense_df

    if offense_df is None:
        if os.path.exists(offense_parquet_path):
            offense_df = pd.read_parquet(offense_parquet_path)
        else:
            offense_df = pd.DataFrame()

    return offense_df


# add_offense_df
def offense_role_add_df(add_df):
    global offense_df

    offense_df = pd.concat([offense_df, add_df])


# save_offense_df
def offense_role_save_df():
    global offense_df

    offense_df.reset_index(inplace=True, drop=True)

    offense_df.to_parquet(offense_parquet_path)


# The stats the offense had for that week for each role.  The roles are computed
# using the history, but the stats are for that week
def offense_role_compute(selector: TeamSelect) -> pd.DataFrame:
    """
    For every week, calculate the top players by position by attempt
    """
    advanced_off_df = offense_role_get_df()

    if len(advanced_off_df.index) > 0:
        res_df = advanced_off_df[
            (advanced_off_df["season"] == selector["season"])
            & (advanced_off_df["week"] == selector["week"])
            & (advanced_off_df["team"] == selector["team"])
        ]

        if len(res_df.index) != 0:
            return res_df

    team_season_df = team_selector_decode(selector)
    week = selector["week"]

    # games can get cancelled.  so make sure stats exist for this week.  If they
    # they don't, call one week ago
    if len(team_season_df[team_season_df["week"] == week].index) == 0:
        if week > 1:
            return offense_role_compute(
                {
                    "season": selector["season"],
                    "week": team_season_df["week"].max(),
                    "team": selector["team"],
                }
            )

    top_receivers = stats_sort_recievers(team_season_df, week, 3)
    receivers_df = stats_week(selector, top_receivers)

    if len(top_receivers) < 3:
        receivers_df = pd.concat([receivers_df, stats_fake(3 - len(top_receivers))])
    receivers_df["playerPosition"] = "wr"

    top_rushers = stats_sort_rushers(team_season_df, week, 2)
    rushers_df = stats_week(selector, top_rushers)
    if len(top_rushers) < 2:
        rushers_df = pd.concat([rushers_df, stats_fake(2 - len(top_rushers))])
    rushers_df["playerPosition"] = "rb"

    top_qb = stats_sort_quarterback(team_season_df, week, 1)
    qb_df = stats_week(selector, top_qb)
    if len(top_qb) < 1:
        qb_df = stats_fake(1)
    qb_df["playerPosition"] = "qb"

    stats_df = pd.concat([receivers_df, rushers_df, qb_df])

    if len(top_receivers + top_rushers + top_qb) == 0:
        # I'm not sure how this was happening.  I might need to remove it and see what breaks again
        # theoretically this should never be possible
        rest_df = stats_fake(1)
    else:
        rest_df = stats_week(
            selector,
            top_receivers + top_rushers + top_qb,
            include=False,
            aggregate=True,
        )

        # If the team was so bad that no one helped, we gotta add junk data
        if (len(res_df.index) == 0):
            rest_df = stats_fake(1)

    rest_df["playerPosition"] = "rest"

    stats_df = pd.concat([stats_df, rest_df])

    stats_df["role"] = stats_roles
    stats_df["season"] = selector["season"]
    stats_df["week"] = week
    stats_df["team"] = selector["team"]

    offense_role_add_df(stats_df)

    return stats_df


def offsense_selector_decode(selector: TeamSelect) -> pd.DataFrame:
    return pd.concat(
        [
            offense_role_compute(
                {"season": selector["season"], "week": w, "team": selector["team"]}
            )
            for w in range(selector["week"], 0, -1)
        ]
    )
