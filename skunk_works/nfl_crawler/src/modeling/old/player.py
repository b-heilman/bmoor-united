import os
import pandas as pd
import pathlib

from .selector import (
    PlayerSelector,
    PlayersSelector,
    WeekSelect,
)

base_dir = str(pathlib.Path(__file__).parent.resolve())





player_df = None





def player_get_history(season, week, player) -> pd.DataFrame:
    players_df = players_get_df()

    return players_df[
        (players_df["season"] == season)
        & (players_df["week"] <= week)
        & (players_df["playerDisplay"] == player)
    ]


def player_selector_decode(selector: PlayerSelector) -> pd.DataFrame:
    if isinstance(selector, pd.DataFrame):
        return selector
    else:
        return player_get_history(
            selector["season"], selector["week"], selector["player"]
        )


def players_get_history(selector: WeekSelect, players=None):
    players_df = players_get_df()

    if players is None:
        return players_df[
            (players_df["season"] == selector["season"])
            & (players_df["week"] <= selector["week"])
        ]
    else:
        return players_df[
            (players_df["season"] == selector["season"])
            & (players_df["week"] <= selector["week"])
            & (players_df["playerDisplay"].isin(players))
        ]


def players_selector_decode(selector: PlayersSelector) -> pd.DataFrame:
    if isinstance(selector, pd.DataFrame):
        return selector
    else:
        return players_get_history(
            {
                "season": selector["season"],
                "week": selector["week"],
            },
            selector["players"],
        )


def players_history(season, week, team, players=None):
    players_df = players_get_history(season, week, players)

    return players_df[(players_df["teamDisplay"] == team)]
