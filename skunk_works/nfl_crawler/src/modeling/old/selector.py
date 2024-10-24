import pandas as pd

from typing import TypedDict

# I don't think I need this, I will always have a max week
# for a season select, so it's TeamSelect
# class TeamSeasonSelect(TypedDict):
#    season: int
#    team: str

# TeamSeasonSelector = pd.DataFrame | TeamSeasonSelect


# Select all the data for a league up to a certain week
class WeekSelect(TypedDict):
    season: int
    week: int


WeekSelector = pd.DataFrame | WeekSelect


# Used to select all the data for a team up to a week in a season
class TeamSelect(WeekSelect):
    team: str


TeamSelector = pd.DataFrame | TeamSelect


# Used to select the data for a player up to a selected week in a season
class PlayerSelect(WeekSelect):
    player: str


PlayerSelector = pd.DataFrame | PlayerSelect


# Used to select the data for a group of players up to a week in a season
class PlayersSelect(WeekSelect):
    players: list[str]


PlayersSelector = pd.DataFrame | PlayersSelect
