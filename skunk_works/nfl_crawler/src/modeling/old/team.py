import pandas as pd

from .player import (
    players_get_df,
)

from .selector import TeamSelect, TeamSelector

team_alias = {
    "NYG": "NYG",
    "DAL": "DAL",
    "NO": "NO",
    "ATL": "ATL",
    "LAR": "STL",
    "CHI": "CHI",
    "MIN": "MIN",
    "GB": "GB",
    "PIT": "PIT",
    "IND": "IND",
    "DEN": "DEN",
    "NYJ": "NYJ",
    "PHI": "PHI",
    "TB": "TB",
    "CIN": "CIN",
    "CAR": "CAR",
    "JAX": "JAX",
    "HOU": "HOU",
    "WSH": "WSH",
    "ARI": "ARI",
    "NE": "NE",
    "SF": "SF",
    "CLE": "CLE",
    "LV": "OAK",
    "KC": "KC",
    "LAC": "SD",
    "BUF": "BUF",
    "BAL": "BAL",
    "TEN": "TEN",
    "MIA": "MIA",
    "SEA": "SEA",
    "DET": "DET",
}


def team_selector_decode(selector: TeamSelector) -> pd.DataFrame:
    if isinstance(selector, pd.DataFrame):
        return selector
    else:
        players_df = players_get_df()

        return players_df[
            (players_df["season"] == selector["season"])
            & (players_df["week"] <= selector["week"])
            & (players_df["teamDisplay"] == selector["team"])
        ]


# players_team_week
def team_week(selector: TeamSelector):
    players_df = players_get_df()

    return players_df[
        (players_df["season"] == selector["season"])
        & (players_df["week"] == selector["week"])
        & (players_df["team"] == selector["team"])
    ]


# players_team_history
def players_team_history(selector: TeamSelector):
    players_df = players_get_df()

    return players_df[
        (players_df["season"] == selector["season"])
        & (players_df["week"] <= selector["week"])
        & (players_df["team"] == selector["team"])
    ]


# reduce_by_pos
# players_filter_by_usage



# get_rank
# players_sort_by_usage



def _join_rank(base_dict: dict, add_dict: dict) -> dict:
    for key, value in add_dict.items():
        if key in base_dict:
            base_dict[key] += value
        else:
            base_dict[key] = value

    return base_dict


# get_top
def team_usage_ranking(
    selector: TeamSelector,
    week: int,
    count: int = 3,
    sort_field: str = "recAtt",
    rtn_field: str = "playerDisplay",
) -> dict:
    df = team_selector_decode(selector)

    res = _join_rank(
        team_sort_by_usage(df, week - 1, count, sort_field, rtn_field),
        _join_rank(
            team_sort_by_usage(df, week - 3, count, sort_field, rtn_field),
            team_sort_by_usage(df, week - 5, count, sort_field, rtn_field),
        ),
    )

    return dict(sorted(res.items(), key=lambda item: item[1], reverse=True)[0:count])
