import os
import pandas as pd
import pathlib

from .opponent import opponent_get
from .selector import TeamSelect, WeekSelect

from .defense import defense_role_compute
from .offense import offense_role_compute

from .common import roles as stats_roles

from .team import (
    team_alias,
)

base_dir = str(pathlib.Path(__file__).parent.resolve())


def rating_calculate_off_pass(player_row) -> float:
    if player_row["passAtt"] == 0:
        return 0

    # Step 1: Calculate completion percentage component (a)
    a = ((player_row["passCmp"] / player_row["passAtt"]) - 0.3) * 5
    a = max(0, min(a, 2.375))

    # Step 2: Calculate yards per attempt component (b)
    b = ((player_row["passYds"] / player_row["passAtt"]) - 3) * 0.25
    b = max(0, min(b, 2.375))

    # Step 3: Calculate touchdown percentage component (c)
    c = (player_row["passTd"] / player_row["passAtt"]) * 20
    c = max(0, min(c, 2.375))

    # Step 4: Calculate interception percentage component (d)
    d = 2.375 - ((player_row["passInt"] / player_row["passAtt"]) * 25)
    d = max(0, min(d, 2.375))

    # Step 5: Combine components and calculate passer rating
    qb_rating = ((a + b + c + d) / 6) * 100

    return qb_rating


def rating_calculate_off_rush(player_row) -> float:
    # Avoid division by zero
    if player_row["rushAtt"] == 0:
        return 0

    yds = player_row["rushYds"] / 3

    att = player_row["rushAtt"] / 10

    ypc = player_row["rushYds"] / player_row["rushAtt"]
    if player_row["rushAtt"] < 3:
        ypc_multiplier = 0
    elif player_row["rushAtt"] > 15:
        ypc_multiplier = 15
    elif player_row["rushAtt"] > 5:
        ypc_multiplier = 7
    else:
        ypc_multiplier = 5

    tpc = player_row["rushTd"] / player_row["rushAtt"]
    fpc = player_row["fumblesLost"] / player_row["rushAtt"]

    rb_rating = yds + att + (ypc * ypc_multiplier) + (tpc * 40) - (fpc * 15)

    return max(0, rb_rating)


def rating_calculate_off_rec(player_row) -> float:
    # Avoid division by zero
    if player_row["recAtt"] == 0 or player_row["recCmp"] == 0:
        return 0

    yds = player_row["recYds"] / 3

    rec_rate = player_row["recCmp"] / player_row["recAtt"]
    ypr = (player_row["recYds"] * rec_rate) / 2
    tpr = player_row["recTd"] / player_row["recCmp"]
    fpr = player_row["fumblesLost"] / player_row["recCmp"]

    wr_rating = yds + ypr + (rec_rate * 60) + (tpr * 60) - (fpr * 15)

    return max(0, wr_rating)


def rating_calculate_off(player_row, qb=0.1, rb=0.2, wr=0.7):
    if qb > 0:
        passing = rating_calculate_off_pass(player_row)
    else:
        passing = 0

    if rb > 0:
        rushing = rating_calculate_off_rush(player_row)
    else:
        rushing = 0

    if wr > 0:
        rec = rating_calculate_off_rec(player_row)
    else:
        rec = 0

    rtn = qb * passing + rb * rushing + wr * rec

    return rtn


# write a rating for def_rush, def_pass, def_qb
# use a score of 100 as the base
pass_baseline = rating_calculate_off_pass(
    {"passAtt": 30, "passCmp": 20, "passYds": 220, "passTd": 2, "passInt": 0.5}
)
rush_baseline = rating_calculate_off_rush(
    {"rushAtt": 16, "rushYds": 80, "rushTd": 1, "fumblesLost": 0.5}
)
rec_baseline = rating_calculate_off_rec(
    {"recAtt": 10, "recCmp": 6, "recYds": 100, "recTd": 1, "fumblesLost": 0.5}
)


def rating_calculate_def_pass(player_row) -> float:
    if player_row["passAtt"] > 2:
        return rating_calculate_off_pass(player_row) - pass_baseline
    else:
        return 0


def rating_calculate_def_rush(player_row) -> float:
    if player_row["rushAtt"] > 2:
        return rating_calculate_off_rush(player_row) - rush_baseline
    else:
        return 0


def rating_calculate_def_rec(player_row) -> float:
    if player_row["recAtt"] > 2:
        return rating_calculate_off_rec(player_row) - rec_baseline
    else:
        return 0


def rating_calculate_def(player_row, qb=0.1, rb=0.2, wr=0.7) -> float:
    if qb > 0:
        passing = rating_calculate_def_pass(player_row)
    else:
        passing = 0

    if rb > 0:
        rushing = rating_calculate_def_rush(player_row)
    else:
        rushing = 0

    if wr > 0:
        rec = rating_calculate_def_rec(player_row)
    else:
        rec = 0

    rtn = qb * passing + rb * rushing + wr * rec

    return rtn


def rating_calculate_off_qb(player_row) -> float:
    return rating_calculate_off(player_row, qb=1, rb=0.25, wr=0.0)


def rating_calculate_off_rb(player_row) -> float:
    return rating_calculate_off(player_row, qb=0, rb=1, wr=0.25)


def rating_calculate_off_wr(player_row) -> float:
    return rating_calculate_off(player_row, qb=0.0, rb=0.25, wr=1)


def rating_calculate_off_rest(player_row) -> float:
    return rating_calculate_off(player_row, qb=0.1, rb=0.45, wr=0.45)


def rating_calculate_def_qb(player_row) -> float:
    return rating_calculate_def(player_row, qb=1, rb=0.25, wr=0.0)


def rating_calculate_def_rb(player_row) -> float:
    return rating_calculate_def(player_row, qb=0, rb=1, wr=0.1)


def rating_calculate_def_wr(player_row) -> float:
    return rating_calculate_def(player_row, qb=0.0, rb=0.1, wr=1)


def rating_calculate_def_rest(player_row) -> float:
    return rating_calculate_def(player_row, qb=0.1, rb=0.45, wr=0.45)


rating_df = None
rating_parquet_path = os.path.abspath(base_dir + "/../../cache/parquet/rating.parquet")


def rating_get_df() -> pd.DataFrame:
    global rating_df

    if rating_df is None:
        if os.path.exists(rating_parquet_path):
            rating_df = pd.read_parquet(rating_parquet_path)
        else:
            rating_df = pd.DataFrame()

    return rating_df


def rating_add_df(add_df):
    global rating_df

    rating_df = pd.concat([rating_df, add_df])


def rating_save_df():
    global rating_df

    rating_df.reset_index(inplace=True, drop=True)

    rating_df.to_parquet(rating_parquet_path)


def rating_def_compute(indexed_defense_df) -> list[dict]:
    return [
        {
            "side": "def",
            "role": "qb1",
            "rating": rating_calculate_def_qb(indexed_defense_df.loc["qb1"]),
        },
        {
            "side": "def",
            "role": "rb1",
            "rating": rating_calculate_def_rb(indexed_defense_df.loc["rb1"]),
        },
        {
            "side": "def",
            "role": "rb2",
            "rating": rating_calculate_def_rb(indexed_defense_df.loc["rb2"]),
        },
        {
            "side": "def",
            "role": "wr1",
            "rating": rating_calculate_def_wr(indexed_defense_df.loc["wr1"]),
        },
        {
            "side": "def",
            "role": "wr2",
            "rating": rating_calculate_def_wr(indexed_defense_df.loc["wr2"]),
        },
        {
            "side": "def",
            "role": "wr3",
            "rating": rating_calculate_def_wr(indexed_defense_df.loc["wr3"]),
        },
        {
            "side": "def",
            "role": "rest",
            "rating": rating_calculate_def_rest(indexed_defense_df.loc["rest"]),
        },
    ]

def rating_off_compute(indexed_offense_df) -> list[dict]:
    return [{
        "side": "off",
        "role": "qb1",
        "rating": rating_calculate_off_qb(indexed_offense_df.loc["qb1"]),
    },
    {
        "side": "off",
        "role": "rb1",
        "rating": rating_calculate_off_rb(indexed_offense_df.loc["rb1"]),
    },
    {
        "side": "off",
        "role": "rb2",
        "rating": rating_calculate_off_rb(indexed_offense_df.loc["rb2"]),
    },
    {
        "side": "off",
        "role": "wr1",
        "rating": rating_calculate_off_wr(indexed_offense_df.loc["wr1"]),
    },
    {
        "side": "off",
        "role": "wr2",
        "rating": rating_calculate_off_wr(indexed_offense_df.loc["wr2"]),
    },
    {
        "side": "off",
        "role": "wr3",
        "rating": rating_calculate_off_wr(indexed_offense_df.loc["wr3"]),
    },
    {
        "side": "off",
        "role": "rest",
        "rating": rating_calculate_off_rest(indexed_offense_df.loc["rest"]),
    }]

def rating_compute(selector: TeamSelect):
    season = selector["season"]
    week = selector["week"]
    team = selector["team"]

    rating_df = rating_get_df()

    if len(rating_df.index) > 0:
        res_df = rating_df[
            (rating_df["season"] == season)
            & (rating_df["week"] == week)
            & (rating_df["team"] == team)
        ]

        if len(res_df.index) != 0:
            return res_df

    res = pd.DataFrame(
        rating_def_compute(defense_role_compute(selector).set_index("role")) +
        rating_off_compute(offense_role_compute(selector).set_index("role"))
    )

    res["season"] = season
    res["week"] = week
    res["team"] = team

    rating_add_df(res)

    return res


def rating_compute_decode(selector: TeamSelect) -> pd.DataFrame:
    return pd.concat(
        [
            rating_compute(
                {"season": selector["season"], "week": w, "team": selector["team"]}
            )
            for w in range(selector["week"], 0, -1)
        ]
    )


def rating_selector_across(selector: WeekSelect) -> pd.DataFrame:
    return pd.concat(
        [
            rating_compute(
                {"season": selector["season"], "week": selector["week"], "team": team}
            )
            for team in team_alias.values()
        ]
    )


def rating_compute_average(selector: TeamSelect) -> pd.DataFrame:
    df = rating_compute_decode(selector)

    return df.groupby(["team", "role"]).mean().reset_index().set_index("role")


rating_diff_df = None
rating_diff_parquet_path = os.path.abspath(
    base_dir + "/../../cache/parquet/rating_diff.parquet"
)


def rating_diff_get_df() -> pd.DataFrame:
    global rating_df

    if rating_df is None:
        if os.path.exists(rating_diff_parquet_path):
            rating_df = pd.read_parquet(rating_diff_parquet_path)
        else:
            rating_df = pd.DataFrame()

    return rating_df


def rating_diff_add_df(add_df):
    global rating_df

    rating_df = pd.concat([rating_df, add_df])


def rating_diff_save_df():
    global rating_df

    rating_df.reset_index(inplace=True, drop=True)

    rating_df.to_parquet(rating_parquet_path)


"""
This calculation should be how above or below the player's average for
that week's average.
"""
def rating_compute_diff(selector: TeamSelect):
    rating_df = rating_diff_get_df()

    if len(rating_df.index) > 0:
        res_df = rating_df[
            (rating_df["season"] == selector["season"])
            & (rating_df["week"] == selector["week"])
            & (rating_df["team"] == selector["team"])
        ]

        if len(res_df.index) != 0:
            return res_df

    opponent = opponent_get(selector)
    if opponent is None:
        return pd.DataFrame()

    week_df = rating_compute(selector).set_index("role")
    self_week_df = week_df[week_df["side"] == "off"]

    week_df = rating_compute({
        'season': selector['season'],
        'week': selector['season'],
        'team': opponent,
    }).set_index("role")
    opp_week_df = week_df[week_df["side"] == "off"]

    if selector["week"] == 1:
        history = rating_selector_across(
            {"season": selector["season"], "week": selector["week"]}
        )

        opp_history_df = self_history_df = (
            history[history["side"] == "off"]
            .groupby(["role"])
            .mean()
            .reset_index()
            .set_index("role")
        )
    else:
        history = rating_compute_decode(
            {
                "season": selector["season"],
                "week": selector["week"] - 1,
                "team": selector["team"],
            }
        )

        self_history_df = (
            history[history["side"] == "off"]
            .groupby(["role"])
            .mean()
            .reset_index()
            .set_index("role")
        )

        opponent_history = rating_compute_decode(
            {
                "season": selector["season"],
                "week": selector["week"] - 1,
                "team": opponent,
            }
        )

        opp_history_df = (
            opponent_history[opponent_history["side"] == "off"]
            .groupby(["role"])
            .mean()
            .reset_index()
            .set_index("role")
        )

    # compute offense
    # get average for rating per role
    # compare to rating of this week

    off_delta_df = pd.DataFrame(
        [self_week_df.loc[role] - self_history_df.loc[role] for role in stats_roles]
    )
    off_delta_df["role"] = stats_roles
    off_delta_df["side"] = "off"

    # compute defense
    # get average for rating of opponent of role
    # compare to rating of this week

    def_delta_df = pd.DataFrame(
        [opp_week_df.loc[role] - opp_history_df.loc[role] for role in stats_roles]
    )
    def_delta_df["role"] = stats_roles
    def_delta_df["side"] = "def"

    delta_df = pd.concat([off_delta_df, def_delta_df])
    delta_df["season"] = selector["season"]
    delta_df["week"] = selector["week"]
    delta_df["team"] = selector["team"]

    rating_diff_add_df(delta_df)

    return delta_df
