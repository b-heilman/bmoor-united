import os
import pandas as pd
import pathlib

from .common import SimpleAccess, Select

base_dir = str(pathlib.Path(__file__).parent.resolve())

def cleanup_players(df):
    df["week"] = pd.to_numeric(df["week"])
    df["played"] = 1

    return df

raw_games = SimpleAccess(
    os.path.abspath(base_dir + "/../../cache/parquet/games.parquet"),
    cleanup_players,
    lambda df, s: (df["homeTeamDisplay"] == s["team"]) | (df["awayTeamDisplay"] == s["team"])
)

raw_players = SimpleAccess(
    os.path.abspath(base_dir + "/../../cache/parquet/players.parquet"),
    None,
    lambda df, s: df["teamDisplay"] == s["team"]
)

def get_opponent(selector: Select):
    game = raw_games.access_week(selector)

    return (game["homeTeamDisplay"]
        if game["homeTeamDisplay"] != selector["team"]
        else game["awayTeamDisplay"]
    )