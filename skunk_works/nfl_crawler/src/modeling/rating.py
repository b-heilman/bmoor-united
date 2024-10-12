import os
import pandas as pd
import pathlib

from .role import role_history
from .opponent import opponent_get
from .selector import TeamSelect

from .defense import defense_selector_decode

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

    # Step 1: Calculate Yards per Carry (YPC)
    ypc = player_row["rushYds"] / player_row["rushAtt"]

    # Step 2: Calculate Touchdowns per Carry
    tpc = player_row["rushTd"] / player_row["rushAtt"]

    # Step 3: Calculate Fumbles per Carry (negative impact)
    fpc = player_row["fumblesLost"] / player_row["rushAtt"]


    # Custom weightings can be adjusted based on preference
    # Step 5: Calculate the RB rating (custom formula combining rush and receiving)
    rb_rating = (ypc * 26) + (tpc * 50) - (fpc * 15)

    # Ensure a positive rating
    return max(0, rb_rating)


def rating_calculate_off_rec(player_row) -> float:
    # Avoid division by zero
    if player_row["recAtt"] == 0 or player_row["recCmp"] == 0:
        return 0

    # Step 1: Calculate Yards per Reception (YPR)
    ypr = player_row["recYds"] / player_row["recCmp"]

    # Step 2: Calculate Touchdowns per Reception (Td/R)
    tpr = player_row["recTd"] / player_row["recCmp"]

    # Step 3: Calculate Catch Rate (Receptions per Target)
    catch_rate = player_row["recCmp"] / player_row["recAtt"]

    # Step 4: Calculate Fumbles per Reception (Negative impact)
    fpr = player_row["fumblesLost"] / player_row["recCmp"]

    # Custom weightings can be adjusted based on preference
    # Step 5: Combine metrics into WR rating
    wr_rating = (ypr * 4.8) + (tpr * 25) + (catch_rate * 25) - (fpr * 10)

    # Ensure the rating is positive
    return max(0, wr_rating)

def rating_calculate_off(player_row, qb = 0.1, rb=0.2, wr=0.7):
    if qb > 0:
        passing = qb * rating_calculate_off_pass(player_row)
    else:
        passing = 0

    if rb > 0:
        rushing = rb * rating_calculate_off_rush(player_row)
    else:
        rushing = 0

    if wr > 0:
        rec = wr * rating_calculate_off_rec(player_row)
    else:
        rec = 0

    return passing + rushing + rec


# write a rating for def_rush, def_pass, def_qb
# use a score of 100 as the base
pass_baseline = rating_calculate_off_pass(
    {'passAtt': 30, 'passCmp': 20, 'passYds': 220, 'passTd': 2, 'passInt': 0.5}
)
rush_baseline = rating_calculate_off_rush(
    {'rushAtt': 16, 'rushYds': 60, 'rushTd': 1, 'fumblesLost': 0.5}
)
rec_baseline = rating_calculate_off_rec(
    {'recAtt': 9, 'recCmp': 6, 'recYds': 100, 'recTd': 1, 'fumblesLost': 0.5}
)

def rating_calculate_def_pass(player_row) -> float:
    return rating_calculate_off_pass(player_row) - pass_baseline
    

def rating_calculate_def_rush(player_row) -> float:
    return rating_calculate_off_rush(player_row) - rush_baseline

def rating_calculate_def_rec(player_row) -> float:
    return rating_calculate_off_rec(player_row) - rec_baseline

def rating_calculate_def(player_row, qb = 0.1, rb=0.2, wr=0.7):
    if qb > 0:
        passing = qb * rating_calculate_def_pass(player_row)
    else:
        passing = 0

    if rb > 0:
        rushing = rb * rating_calculate_def_rush(player_row)
    else:
        rushing = 0

    if wr > 0:
        rec = wr * rating_calculate_def_rec(player_row)
    else:
        rec = 0

    return passing + rushing + rec

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

def rating_calculate_off_qb(selector, role="qb1"):
    return rating_calculate_off(
        role_history(selector, role), 
        qb=1, rb=2, wr=0.0
    ),

def rating_calculate_off_rb(selector, role="rb1"):
    return rating_calculate_off(
        role_history(selector, role), 
        qb=0, rb=1, wr=1.5
    ),

def rating_calculate_off_wr(selector, role="wr1"):
    return rating_calculate_off(
        role_history(selector, role), 
        qb=0.0, rb=1.5, wr=1
    ),

def rating_calculate_off_rest(selector, role="rest"):
    return rating_calculate_off(
        role_history(selector, role), 
        qb=1, rb=1, wr=1
    ),

def rating_calculate_def_qb(selector, role="qb1"):
    return rating_calculate_def(
        role_history(selector, role), 
        qb=1, rb=2, wr=0.0
    ),

def rating_calculate_def_rb(selector, role="rb1"):
    return rating_calculate_def(
        role_history(selector, role), 
        qb=0, rb=1, wr=1.5
    ),

def rating_calculate_def_wr(selector, role="wr1"):
    return rating_calculate_def(
        role_history(selector, role), 
        qb=0.0, rb=1.5, wr=1
    ),

def rating_calculate_def_rest(selector, role="rest"):
    return rating_calculate_def(
        role_history(selector, role), 
        qb=1, rb=1, wr=1
    ),

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

    # we want the average rating for that position up to this week
    # TODO
    # - get this week's data for offense
    # - get opponent
    #   - get this week's data for offense, run through defense rating
    season_df = defense_selector_decode(selector)

    roles_df = (
        season_df.groupby(["team", "role"]).mean().reset_index().set_index("role")
    )

    res = pd.DataFrame(
        [
            {
                "side": "def",
                "role": "qb1",
                "rating": rating_calculate_def_qb(roles_df.loc["qb1"]),
            },
            {
                "side": "def",
                "role": "rb1",
                "rating": rating_calculate_def_rush(roles_df.loc["rb1"]),
            },
            {
                "side": "def",
                "role": "rb2",
                "rating": rating_calculate_def_rush(roles_df.loc["rb2"]),
            },
            {
                "side": "def",
                "role": "wr1",
                "rating": rating_calculate_def_pass(roles_df.loc["wr1"]),
            },
            {
                "side": "def",
                "role": "wr2",
                "rating": rating_calculate_def_pass(roles_df.loc["wr2"]),
            },
            {
                "side": "def",
                "role": "wr3",
                "rating": rating_calculate_def_pass(roles_df.loc["wr3"]),
            },
            {
                "side": "def",
                "role": "rest",
                "rating": rating_calculate_def(roles_df.loc["rest"]),
            },
            {
                "side": "off",
                "role": "qb1",
                "rating": rating_calculate_off(
                    role_history(selector,"qb1"), 
                    qb=1, rb=2, wr=0.0
                ),
            },
            {
                "side": "off",
                "role": "rb1",
                "rating": rating_calculate_off(
                    role_history(selector, "rb1"), 
                    qb=0, rb=1, wr=1.5
                ),
            },
            {
                "side": "off",
                "role": "rb2",
                "rating": rating_calculate_off(
                    role_history(selector, "rb2"), 
                    qb=0, rb=1, wr=1.5
                ),
            },
            {
                "side": "off",
                "role": "wr1",
                "rating": rating_calculate_off(
                    role_history(selector, "wr1"), 
                    qb=0.0, rb=1.5, wr=1
                ),
            },
            {
                "side": "off",
                "role": "wr2",
                "rating": rating_calculate_off(
                    role_history(selector, "wr2"), 
                    qb=0.0, rb=1.5, wr=1
                ),
            },
            {
                "side": "off",
                "role": "wr3",
                "rating": rating_calculate_off(
                    role_history(selector, "wr3"), 
                    qb=0.0, rb=1.5, wr=1
                ),
            },
            {
                "side": "off",
                "role": "rest",
                "rating": rating_calculate_off(
                    role_history(selector, "rest"), 
                    qb=1, rb=1, wr=1
                ),
            },
        ]
    )

    res["season"] = season
    res["week"] = week
    res["team"] = team

    rating_add_df(res)

    return res
