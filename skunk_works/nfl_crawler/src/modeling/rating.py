import os
import pandas as pd
import pathlib

from .common import player_roles, SelectSide, ComputeAccess
from .usage import player_usage
from .games import get_opponent

base_dir = str(pathlib.Path(__file__).parent.resolve())


def calculate_off_pass_rating(player_row) -> float:
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


def calculate_off_rush_rating(player_row) -> float:
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


def calculate_off_rec_rating(player_row) -> float:
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


def calculate_off_rating(player_row, qb=0.1, rb=0.2, wr=0.7):
    if qb > 0:
        passing = calculate_off_pass_rating(player_row)
    else:
        passing = 0

    if rb > 0:
        rushing = calculate_off_rush_rating(player_row)
    else:
        rushing = 0

    if wr > 0:
        rec = calculate_off_rec_rating(player_row)
    else:
        rec = 0

    rtn = qb * passing + rb * rushing + wr * rec

    return rtn


# write a rating for def_rush, def_pass, def_qb
# use a score of 100 as the base
pass_baseline = calculate_off_pass_rating(
    {"passAtt": 30, "passCmp": 20, "passYds": 220, "passTd": 2, "passInt": 0.5}
)
rush_baseline = calculate_off_rush_rating(
    {"rushAtt": 16, "rushYds": 80, "rushTd": 1, "fumblesLost": 0.5}
)
rec_baseline = calculate_off_rec_rating(
    {"recAtt": 10, "recCmp": 6, "recYds": 100, "recTd": 1, "fumblesLost": 0.5}
)


def calculate_def_pass_rating(player_row) -> float:
    if player_row["passAtt"] > 2:
        return calculate_off_pass_rating(player_row) - pass_baseline
    else:
        return 0


def calculate_def_rush_rating(player_row) -> float:
    if player_row["rushAtt"] > 2:
        return calculate_off_rush_rating(player_row) - rush_baseline
    else:
        return 0


def calculate_def_rec_rating(player_row) -> float:
    if player_row["recAtt"] > 2:
        return calculate_off_rec_rating(player_row) - rec_baseline
    else:
        return 0


def calculate_def_rating(player_row, qb=0.1, rb=0.2, wr=0.7) -> float:
    if qb > 0:
        passing = calculate_def_pass_rating(player_row)
    else:
        passing = 0

    if rb > 0:
        rushing = calculate_def_rush_rating(player_row)
    else:
        rushing = 0

    if wr > 0:
        rec = calculate_def_rec_rating(player_row)
    else:
        rec = 0

    rtn = qb * passing + rb * rushing + wr * rec

    return rtn


def calculate_off_qb_rating(player_row) -> float:
    return calculate_off_rating(player_row, qb=1, rb=0.25, wr=0.0)


def calculate_off_rb_rating(player_row) -> float:
    return calculate_off_rating(player_row, qb=0, rb=1, wr=0.25)


def calculate_off_wr_rating(player_row) -> float:
    return calculate_off_rating(player_row, qb=0.0, rb=0.25, wr=1)


def calculate_off_rest_rating(player_row) -> float:
    return calculate_off_rating(player_row, qb=0.1, rb=0.45, wr=0.45)


def calculate_def_qb_rating(player_row) -> float:
    return calculate_def_rating(player_row, qb=1, rb=0.25, wr=0.0)


def calculate_def_rb_rating(player_row) -> float:
    return calculate_def_rating(player_row, qb=0, rb=1, wr=0.1)


def calculate_def_wr_rating(player_row) -> float:
    return calculate_def_rating(player_row, qb=0.0, rb=0.1, wr=1)


def calculate_def_rest_rating(player_row) -> float:
    return calculate_def_rating(player_row, qb=0.1, rb=0.45, wr=0.45)


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
            "rating": calculate_def_qb_rating(indexed_defense_df.loc["qb1"]),
        },
        {
            "side": "def",
            "role": "rb1",
            "rating": calculate_def_rb_rating(indexed_defense_df.loc["rb1"]),
        },
        {
            "side": "def",
            "role": "rb2",
            "rating": calculate_def_rb_rating(indexed_defense_df.loc["rb2"]),
        },
        {
            "side": "def",
            "role": "wr1",
            "rating": calculate_def_wr_rating(indexed_defense_df.loc["wr1"]),
        },
        {
            "side": "def",
            "role": "wr2",
            "rating": calculate_def_wr_rating(indexed_defense_df.loc["wr2"]),
        },
        {
            "side": "def",
            "role": "wr3",
            "rating": calculate_def_wr_rating(indexed_defense_df.loc["wr3"]),
        },
        {
            "side": "def",
            "role": "rest",
            "rating": calculate_def_rest_rating(indexed_defense_df.loc["rest"]),
        },
    ]

def rating_off_compute(indexed_offense_df) -> list[dict]:
    return [{
        "side": "off",
        "role": "qb1",
        "rating": calculate_off_qb_rating(indexed_offense_df.loc["qb1"]),
    },
    {
        "side": "off",
        "role": "rb1",
        "rating": calculate_off_rb_rating(indexed_offense_df.loc["rb1"]),
    },
    {
        "side": "off",
        "role": "rb2",
        "rating": calculate_off_rb_rating(indexed_offense_df.loc["rb2"]),
    },
    {
        "side": "off",
        "role": "wr1",
        "rating": calculate_off_wr_rating(indexed_offense_df.loc["wr1"]),
    },
    {
        "side": "off",
        "role": "wr2",
        "rating": calculate_off_wr_rating(indexed_offense_df.loc["wr2"]),
    },
    {
        "side": "off",
        "role": "wr3",
        "rating": calculate_off_wr_rating(indexed_offense_df.loc["wr3"]),
    },
    {
        "side": "off",
        "role": "rest",
        "rating": calculate_off_rest_rating(indexed_offense_df.loc["rest"]),
    }]

def compute_rating(selector: SelectSide):
    if selector['side'] == 'def':
        res = rating_def_compute(
            player_usage.access_week(selector).set_index("role")
        )
    else:
        res = rating_off_compute(
            player_usage.access_week(selector).set_index("role")
        )

    df = pd.DataFrame(res)

    df["season"] = selector['season']
    df["week"] = selector['week']
    df["team"] = selector['team']

    return df

player_rating = ComputeAccess(
    base_dir + "/../../cache/parquet/off_rating.parquet",
    base_dir + "/../../cache/parquet/def_rating.parquet",
    compute_rating
)


"""
This calculation should be how above or below the player's average for
that week's average.
"""
def compute_rating_diff(selector: SelectSide):
    other_side = 'def' if selector['side'] == 'off' else 'off'
    opponent = get_opponent(selector)
    if opponent is None:
        return pd.DataFrame()

    if selector["week"] == 1:
        self_history_df = (
            player_rating.access_across(selector)
            .groupby(["role"])
            .mean()
            .reset_index()
            .set_index("role")
        )

        opp_history_df = (
            player_rating.access_across({
                'season': selector['season'],
                'week': selector['week'],
                'team': opponent,
                'side': other_side
            })
            .groupby(["role"])
            .mean()
            .reset_index()
            .set_index("role")
        )
    else:
        self_history_df = (
            player_rating.access_history(
                {
                    "season": selector["season"],
                    "week": selector["week"],
                    "team": selector["team"],
                    "side": selector["side"]
                }
            )
            .groupby(["role"])
            .mean()
            .reset_index()
            .set_index("role")
        )

        opp_history_df = (
            player_rating.access_across({
                'season': selector['season'],
                'week': selector['week'],
                'team': opponent,
                'side': other_side
            })
            .groupby(["role"])
            .mean()
            .reset_index()
            .set_index("role")
        )

    print('=================')
    print(self_history_df)
    print(opp_history_df)
    delta_df = pd.DataFrame(
        [self_history_df.loc[role] - opp_history_df.loc[role] for role in player_roles]
    )

    delta_df["role"] = player_roles
    delta_df["season"] = selector["season"]
    delta_df["week"] = selector["week"]
    delta_df["team"] = selector["team"]

    return delta_df

player_rating_deltas = ComputeAccess(
    base_dir + "/../../cache/parquet/off_rating.parquet",
    base_dir + "/../../cache/parquet/def_rating.parquet",
    compute_rating_diff
)