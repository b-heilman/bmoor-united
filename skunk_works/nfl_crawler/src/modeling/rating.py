import os
import pandas as pd
import pathlib

from .role import role_history

from .selector import TeamSelect

from .defense import defense_selector_decode

base_dir = str(pathlib.Path(__file__).parent.resolve())


def rating_calculate_off_qb(player_row) -> float:
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


def rating_calculate_off_rb(player_row) -> float:
    # Avoid division by zero
    if player_row["rushAtt"] == 0:
        return 0

    # Step 1: Calculate Yards per Carry (YPC)
    ypc = player_row["rushYds"] / player_row["rushAtt"]

    # Step 2: Calculate Touchdowns per Carry
    tpc = player_row["rushTd"] / player_row["rushAtt"]

    # Step 3: Calculate Fumbles per Carry (negative impact)
    fpc = player_row["fumblesLost"] / player_row["rushAtt"]

    # Step 4: Add Receiving Performance (if applicable)
    if player_row["recCmp"] > 0:
        receiving_effect = (player_row["recYds"] / player_row["recCmp"]) + (
            player_row["recTd"] / player_row["recCmp"]
        )
    else:
        receiving_effect = 0

    # Custom weightings can be adjusted based on preference
    # Step 5: Calculate the RB rating (custom formula combining rush and receiving)
    rb_rating = (ypc * 5) + (tpc * 20) - (fpc * 15) + (receiving_effect * 2)

    # Ensure a positive rating
    return max(0, rb_rating)


def rating_calculate_off_wr(player_row) -> float:
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
    wr_rating = (ypr * 3) + (tpr * 25) + (catch_rate * 20) - (fpr * 10)

    # Ensure the rating is positive
    return max(0, wr_rating)


def rating_calculate_def(attempts, completions, yards, touchdowns, turnovers):
    # Positive score means the defense is good, negative is bad

    # if attempts went down, but completions went up, bad for defense
    # attempts up, completions down, good for defense
    score = (attempts - completions) * 3

    if completions < 0:
        score -= completions * 5

    if attempts < 0:
        score -= attempts * 5

    return score + -(+(yards) + (touchdowns * 7) - turnovers * 10)


def rating_calculate_def_team(player_row):
    return rating_calculate_def(
        player_row["passAtt"],
        player_row["passCmp"],
        player_row["passYds"],
        player_row["passTd"],
        player_row["passInt"],
    ) + rating_calculate_def(
        player_row["rushAtt"],
        player_row["rushAtt"],
        player_row["rushYds"],
        player_row["rushTd"],
        player_row["fumblesLost"],
    )


def rating_calculate_def_qb(player_row):
    return rating_calculate_def(
        player_row["passAtt"],
        player_row["passCmp"],
        player_row["passYds"],
        player_row["passTd"],
        player_row["passInt"],
    )


def rating_calculate_def_wr(player_row):
    return rating_calculate_def(
        player_row["recAtt"],
        player_row["recCmp"],
        player_row["recYds"],
        player_row["recTd"],
        player_row["fumblesLost"],
    )


def rating_calculate_def_rb(player_row):
    return rating_calculate_def(
        player_row["rushAtt"],
        player_row["rushAtt"],
        player_row["rushYds"],
        player_row["rushTd"],
        player_row["fumblesLost"],
    )


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
                "rating": rating_calculate_def_rb(roles_df.loc["rb1"]),
            },
            {
                "side": "def",
                "role": "rb2",
                "rating": rating_calculate_def_rb(roles_df.loc["rb2"]),
            },
            {
                "side": "def",
                "role": "wr1",
                "rating": rating_calculate_def_wr(roles_df.loc["wr1"]),
            },
            {
                "side": "def",
                "role": "wr2",
                "rating": rating_calculate_def_wr(roles_df.loc["wr2"]),
            },
            {
                "side": "def",
                "role": "wr3",
                "rating": rating_calculate_def_wr(roles_df.loc["wr3"]),
            },
            {
                "side": "def",
                "role": "rest",
                "rating": rating_calculate_def_wr(roles_df.loc["rest"]),
            },
            {
                "side": "off",
                "role": "qb1",
                "rating": rating_calculate_off_qb(
                    role_history(
                        {
                            "season": season,
                            "week": week,
                            "team": team,
                        },
                        "qb1",
                    )
                ),
            },
            {
                "side": "off",
                "role": "rb1",
                "rating": rating_calculate_off_rb(role_history(selector, "rb1")),
            },
            {
                "side": "off",
                "role": "rb2",
                "rating": rating_calculate_off_rb(role_history(selector, "rb2")),
            },
            {
                "side": "off",
                "role": "wr1",
                "rating": rating_calculate_off_wr(role_history(selector, "wr1")),
            },
            {
                "side": "off",
                "role": "wr2",
                "rating": rating_calculate_off_wr(role_history(selector, "wr2")),
            },
            {
                "side": "off",
                "role": "wr3",
                "rating": rating_calculate_off_wr(role_history(selector, "wr3")),
            },
            {
                "side": "off",
                "role": "rest",
                "rating": rating_calculate_off_wr(role_history(selector, "rest")),
            },
        ]
    )

    res["season"] = season
    res["week"] = week
    res["team"] = team

    rating_add_df(res)

    return res
