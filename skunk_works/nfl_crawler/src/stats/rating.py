import os
import pandas as pd
import pathlib

from .common import (
    each_role,
    StatGroupRating,
    player_roles, 
    SelectSide, 
    ComputeAccess
)
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


def calculate_off_rating(player_row, rating: StatGroupRating) -> float:
    qb = rating["qb"]
    wr = rating["wr"]
    rb = rating["rb"]

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


def rating_off_compute(offense_df) -> list[dict]:
    indexed_offense_df = offense_df.set_index("role")

    return each_role(lambda role, group, group_info: {
        "role": role,
        'group': group,
        "rating": calculate_off_rating(indexed_offense_df.loc[role], group_info['rating'])
    })


def compute_rating(selector: SelectSide) -> pd.DataFrame:
    if selector["side"] == "def":
        opp = get_opponent(selector)
        
        return player_ratings.access_week(
            {
                "season": selector["season"],
                "week": selector["week"],
                "team": opp,
                "side": "off",
            }
        ).copy()
    else:
        this_week_df = player_usage.access_week(selector)

        this_index_df = this_week_df.set_index('role')
        rtn = pd.DataFrame(
            rating_off_compute(this_week_df)
        ).set_index('role')

        rtn["playerDisplay"] = [
            this_index_df.loc[role]['playerDisplay'] for role in rtn.index
        ]

        rtn.reset_index(inplace=True)

        return rtn


player_ratings = ComputeAccess(
    base_dir + "/../../cache/parquet/off_rating.parquet",
    base_dir + "/../../cache/parquet/def_rating.parquet",
    compute_rating,
)


def compute_rating_diff(selector: SelectSide) -> pd.DataFrame:
    other_side = "def" if selector["side"] == "off" else "off"
    opponent = get_opponent(selector)

    if selector["week"] == 1:
        history_df = (
            player_ratings.access_across({
                "season": selector["season"],
                "week": selector["week"],
                "team": opponent,
                "side": other_side,
            })
            .groupby(["role"])
            .agg({'group': 'first', 'rating': "mean"})
            .reset_index()
            .set_index("role")
        )
    else:
        history_df = (
            player_ratings.access_history(
                {
                    "season": selector["season"],
                    "week": selector["week"] - 1,
                    "team": opponent,
                    "side": other_side,
                }
            )
            .groupby(["role"])
            .agg({'group': 'first', 'rating': "mean"})
            .reset_index()
            .set_index("role")
        )

    allowed_df = (
        player_ratings.access_week(selector)
        .set_index("role")
    )
    
    try:
        delta_df = pd.DataFrame()
        delta_df['role'] = [role for role in player_roles]
        delta_df['group'] = [allowed_df.loc[role]['group'] for role in player_roles]
        delta_df['rating'] = [
            allowed_df.loc[role]['rating'] - history_df.loc[role]['rating'] for role in player_roles
        ]
    except Exception as ex:
        print('>>>> usage -> failed on: '+str(selector))
        print(allowed_df)
        print(history_df)
        raise ex

    delta_df["role"] = player_roles
    delta_df.set_index("role", inplace=True)

    delta_df["playerDisplay"] = [
        allowed_df.loc[role]['playerDisplay'] for role in player_roles
    ]

    delta_df.reset_index(inplace=True)

    return delta_df


player_rating_deltas = ComputeAccess(
    base_dir + "/../../cache/parquet/off_rating_delta.parquet",
    base_dir + "/../../cache/parquet/def_rating_delta.parquet",
    compute_rating_diff,
)
