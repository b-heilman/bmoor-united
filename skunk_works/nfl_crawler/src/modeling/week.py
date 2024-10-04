import pandas as pd

from .selector import WeekSelector

from .player import players_get_df


def week_selector_decode(selector: WeekSelector) -> pd.DataFrame:
    if isinstance(selector, pd.DataFrame):
        return selector
    else:
        players_df = players_get_df()
        return players_df[
            (players_df["season"] == selector["season"])
            & (players_df["week"] <= selector["week"])
        ]
