import os
import pandas as pd
import traceback

from typing import Callable, TypedDict, Any, Union

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

class StatGroupUsage(TypedDict):
    groupby: Union[str, None]
    maximize: str
    minimize: str
    look_back: Union[int, None]
    limit: Union[int, None]

class StatGroup(TypedDict):
    usage: Union[StatGroupUsage, None]

stat_groups: dict[str, StatGroup] = {
    "qb": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "passAtt",
            "minimize": "rushAtt",
            "limit": 1
        }
    },
    "wr": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "recAtt",
            "minimize": "rushAtt",
            "limit": 3
        }
    },
    "rb": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "rushAtt",
            "minimize": "recAtt",
            "limit": 2
        }
    },
    "passing": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "passAtt",
            "minimize": "rushAtt"
        }
    },
    "receiving": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "recAtt",
            "minimize": "rushAtt"
        }
    },
    "rushing": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "rushAtt",
            "minimize": "recAtt"
        }
    }
}

def each_role(cb):
    rtn = []

    for group, stat_info in stat_groups.items():
        usage = stat_info['usage']

        if 'limit' in usage and usage['limit'] is not None:
            for i in range(usage['limit']):
                rtn.append(cb(group+str(i+1)))
        else:
            rtn.append(cb(group))
    
    return rtn

player_roles = each_role(lambda role: role)

stat_fields = [
    "passCmp",
    "passAtt",
    "passYds",
    "passTd",
    "passInt",
    # "passLong",
    # "passRating",
    # "passTargetYds",
    # passPoor_throws": number,
    # passBlitzed: number,
    # passHurried: number,
    # passScrambles: number,
    "rushAtt",
    "rushYds",
    "rushTd",
    # "rushLong",
    # "rushYdsBc",
    # "rushYdsAc",
    # "rushBrokenTackles",
    "recAtt",
    "recCmp",
    "recYds",
    "recTd",
    # "recDrops",
    # "recLong",
    # "recDepth",
    # "recYac",
    "sacked",
    "fumbles",
    "fumblesLost",
]


class Select(TypedDict):
    season: int
    week: int
    team: str


class SelectSide(Select):
    side: str


def sanitize_selector(selector: Select):
    if selector["team"] in team_alias:
        selector["team"] = team_alias[selector["team"]]


class SimpleAccess:
    def __init__(
        self,
        storage_path: str,
        clean_up=None,
        team_filter: Callable[[pd.DataFrame, Select], Any] = lambda df, s: df["team"]
        == s["team"],
    ):
        self.df = pd.read_parquet(storage_path).sort_values(
            by=["season", "week"], ascending=False
        )
        self.team_filter = team_filter

        if clean_up is not None:
            clean_up(self.df)

    def get_frame(self) -> pd.DataFrame:
        return self.df
    
    def access_week(self, selector: Select) -> pd.DataFrame:
        sanitize_selector(selector)

        return self.df[
            (self.df["season"] == selector["season"])
            & (self.df["week"] == selector["week"])
            & self.team_filter(self.df, selector)
        ]

    def access_history(self, selector: Select) -> pd.DataFrame:
        sanitize_selector(selector)

        return self.df[
            (self.df["season"] == selector["season"])
            & (self.df["week"] <= selector["week"])
            & self.team_filter(self.df, selector)
        ]


registry: list = []


def save_state():
    for reg in registry:
        reg.save()

class NoOpponent(Exception):
    pass

import io
def capture_traceback():
    f = io.StringIO()
    traceback.print_stack(file=f)
    return f.getvalue()

class ComputeAccess:
    def __init__(
        self,
        off_storage_path: str,
        def_storage_path: str,
        access: Callable[[SelectSide], pd.DataFrame],
    ):
        off_storage_path = os.path.abspath(off_storage_path)
        def_storage_path = os.path.abspath(def_storage_path)

        registry.append(self)

        self.access = access
        try:
            self.off_df = pd.read_parquet(off_storage_path)
        except:
            self.off_df = pd.DataFrame()

        try:
            self.def_df = pd.read_parquet(def_storage_path)
        except:
            self.def_df = pd.DataFrame()

        self.off_storage_path = os.path.abspath(off_storage_path)
        self.def_storage_path = os.path.abspath(def_storage_path)

    def get_frame(self, selector: SelectSide) -> pd.DataFrame:
        if selector["side"] == "def":
            return self.def_df
        else:
            return self.off_df

    def save(self):
        self.off_df.reset_index(inplace=True, drop=True)
        self.off_df.to_parquet(self.off_storage_path)

        self.def_df.reset_index(inplace=True, drop=True)
        self.def_df.to_parquet(self.def_storage_path)

    def access_week(self, selector: SelectSide) -> pd.DataFrame:
        sanitize_selector(selector)

        df = self.get_frame(selector)

        if len(df.index) > 0:

            res_df = df[
                (df["season"] == selector["season"])
                & (df["week"] == selector["week"])
                & (df["team"] == selector["team"])
            ]

            if len(res_df.index) != 0:
                return res_df

        try:
            rtn = self.access(selector)

            rtn['season'] = selector['season']
            rtn['week'] = selector['week']
            rtn['team'] = selector['team']
                
            if selector["side"] == "def":
                self.def_df = pd.concat([self.def_df, rtn])
            else:
                self.off_df = pd.concat([self.off_df, rtn])
        except NoOpponent as ex:
            rtn = pd.DataFrame()

        return rtn

    def access_history(self, selector: SelectSide) -> pd.DataFrame:
        sanitize_selector(selector)

        return pd.concat(
            [
                self.access_week(
                    {
                        "season": selector["season"],
                        "week": w,
                        "team": selector["team"],
                        "side": selector["side"],
                    }
                )
                for w in range(selector["week"], 0, -1)
            ]
        )

    def access_across(self, selector: SelectSide) -> pd.DataFrame:
        sanitize_selector(selector)

        todo = list(set(team_alias.values()))
        todo.remove(selector["team"])

        return pd.concat(
            [
                self.access_week(
                    {
                        "season": selector["season"],
                        "week": selector["week"],
                        "team": t,
                        "side": selector["side"],
                    }
                )
                for t in todo
            ]
        )
