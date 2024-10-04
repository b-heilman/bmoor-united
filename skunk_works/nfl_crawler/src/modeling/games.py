import os
import pandas as pd
import pathlib

base_dir = str(pathlib.Path(__file__).parent.resolve())

game_df = None


# NOTE: This is sorted by season:week in ascending, so pop(0) is recent
def game_get_df() -> pd.DataFrame:
    global game_df

    if game_df is None:
        parquet_path = os.path.abspath(base_dir + "/../../cache/parquet/games.parquet")

        game_df = pd.read_parquet(parquet_path).sort_values(
            by=["season", "week"], ascending=False
        )

    return game_df


def games_all() -> pd.DataFrame:
    base = game_get_df()

    home_df = base[["season", "week", "homeTeamDisplay"]].rename(
        columns={"homeTeamDisplay": "team"}
    )
    away_df = base[["season", "week", "awayTeamDisplay"]].rename(
        columns={"awayTeamDisplay": "team"}
    )

    return pd.concat([home_df, away_df]).sort_values(
        by=["season", "week", "team"], ascending=False
    )


def games_matchups() -> pd.DataFrame:
    return game_get_df().sort_values(
        by=["season", "week", "homeTeamDisplay"], ascending=False
    )
