import pandas as pd

from enum import Enum 
from typing import Callable, TypedDict, Any

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

player_roles = ["wr1", "wr2", "wr3", "rb1", "rb2", "qb1", "rest"]

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
    if selector['team'] in team_alias:
        selector['team'] = team_alias[selector['team']]

class SimpleAccess():
    def __init__(self, 
        storage_path: str, 
        clean_up = None, 
        team_filter: Callable[[pd.DataFrame, str], Any] = lambda df, s: df['team'] == s['team']
    ):
        self.df = pd.read_parquet(storage_path).sort_values(
            by=["season", "week"], ascending=False
        )
        self.team_filter = team_filter

        if clean_up is not None:
            clean_up(self.df)

    def access_week(self, selector: Select) -> pd.Series:
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

registry = []

def save_state():
    for reg in registry:
        reg.save()

class ComputeAccess():
    def __init__(
        self,
        off_storage_path: str,
        def_storage_path: str,
        access: Callable[[SelectSide], pd.DataFrame]
    ):
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

        self.off_storage_path = off_storage_path
        self.def_storage_path = def_storage_path

    def get_frame(self, selector: SelectSide) -> pd.DataFrame:
        if selector['side'] == 'def':
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
        
        rtn = self.access(selector)

        if selector['side'] == 'def':
            self.def_df = pd.concat([self.def_df, rtn])
        else:
            self.off_df = pd.concat([self.off_df, rtn])

        return rtn
    
    def access_history(self, selector: SelectSide) -> pd.DataFrame:
        sanitize_selector(selector)
        
        return pd.concat(
            [
                self.access_week({
                    "season": selector["season"], 
                    "week": w, 
                    "team": selector["team"], 
                    "side": selector['side']
                })
                for w in range(selector["week"], 0, -1)
            ]
        )
    
    def access_across(self, selector: SelectSide) -> pd.DataFrame:
        sanitize_selector(selector)
        
        todo = list(set(team_alias.values()))
        todo.remove(selector['team'])

        return pd.concat(
            [
                self.access_week({
                    "season": selector["season"], 
                    "week": selector["week"], 
                    "team": t, 
                    "side": selector['side']
                })
                for t in todo
            ]
        )
        
