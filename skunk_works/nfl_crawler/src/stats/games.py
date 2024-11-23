import os
import pandas as pd
import pathlib

from .common import NoOpponent, SimpleAccess, Select

base_dir = str(pathlib.Path(__file__).parent.resolve())


def cleanup_players(df):
    df["week"] = pd.to_numeric(df["week"])
    df["played"] = 1

    return df


raw_games = SimpleAccess(
    os.path.abspath(base_dir + "/../../cache/parquet/games.parquet"),
    cleanup_players,
    lambda df, s: (df["homeTeamDisplay"] == s["team"])
    | (df["awayTeamDisplay"] == s["team"]),
)

raw_players = SimpleAccess(
    os.path.abspath(base_dir + "/../../cache/parquet/players.parquet"),
    None,
    lambda df, s: df["teamDisplay"] == s["team"],
)

def get_opponent(selector: Select):
    current_week = raw_games.access_week(selector)

    if len(current_week.index) == 0:
        raise NoOpponent('unable to find opponent: '+str(selector))
    game = current_week.iloc[0]

    return (
        game["homeTeamDisplay"]
        if game["homeTeamDisplay"] != selector["team"]
        else game["awayTeamDisplay"]
    )
