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
def team_filter_by_usage(
    selector: TeamSelector,
    gt: str = "recAtt",
    lt: str = "rushAtt",
    unique_field: str = "playerDisplay",
    ignore_field: str = "playerPositionNorm",
    ignore_values: list[str] = ["qb"],
) -> pd.DataFrame:
    df = team_selector_decode(selector)

    usage = df.groupby(unique_field).agg({gt: "sum", lt: "sum", ignore_field: "last"})

    group_df = usage[
        (usage[gt] > usage[lt]) & ~(usage[ignore_field].isin(ignore_values))
    ]

    targets = list(group_df.index)

    return df[df[unique_field].isin(targets)]


# smart_reduce
# players_usage
def team_usage(
    selector: TeamSelector,
    week: int,
    gt: str,
    lt: str,
    ignore_values: list[str] = ["qb"],
) -> pd.DataFrame:
    # reduce only to available players
    df = team_filter_by_usage(selector, gt, lt, ignore_values=ignore_values)

    allowed = df[df["week"] == week]["playerDisplay"].unique()

    return df[df["playerDisplay"].isin(allowed)]


# get_rank
# players_sort_by_usage
def team_sort_by_usage(
    selector: TeamSelector,
    start: int = 0,
    count: int = 3,
    sort_field: str = "recAtt",
    rtn_field: str = "playerDisplay",
    blank_on_fail: bool = False,
) -> dict:
    df = team_selector_decode(selector)

    search = df[(df["week"] > start)]

    info = search.groupby(rtn_field).agg({"played": "count", sort_field: "sum"})

    info["att/g"] = info[sort_field] / info["played"]

    info = info.sort_values(by=["att/g"], ascending=False).head(count)

    if len(info.index) == 0:
        if blank_on_fail or start <= 0:
            return {}
        else:
            return team_sort_by_usage(
                df, start - 1, count, sort_field, rtn_field, blank_on_fail=True
            )
    else:
        rtn = {}
        for i in range(min(count, len(info.index))):
            rtn[info.index[i]] = count - i

        return rtn


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
