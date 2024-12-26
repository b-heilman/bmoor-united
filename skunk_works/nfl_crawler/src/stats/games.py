import os
import pandas as pd
import pathlib

from .common import NoOpponent, SimpleAccess, SelectRange, sanitize_selector

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

def get_schedule(selector: SelectRange) -> list[int]:
    sanitize_selector(selector)
    
    limit = selector['range']
    rtn = list(raw_games.df[
        (raw_games.df['season'] == selector['season']) & 
        ((raw_games.df['homeTeamDisplay'] == selector['team']) | (raw_games.df['awayTeamDisplay'] == selector['team'])) &
        (raw_games.df['week'] <= selector['week'])
    ]['week'])
    
    rtn.sort(reverse=True)

    if limit == 0:
        return rtn
    elif len(rtn) < limit:
        return rtn
    else:
        return rtn[0:limit]

def get_opponent(selector: SelectRange):
    current_week = raw_games.access_week(selector)

    if len(current_week.index) == 0:
        # print('unable to find opponent: '+str(selector))
        raise NoOpponent('unable to find opponent: '+str(selector))
    
    game = current_week.iloc[0]

    return (
        game["homeTeamDisplay"]
        if game["homeTeamDisplay"] != selector["team"]
        else game["awayTeamDisplay"]
    )
