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
    "WAS": "WSH",
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
    limit: Union[int, None]

class StatGroupRating(TypedDict):
    qb: float
    wr: float
    rb: float

class StatGroup(TypedDict):
    usage: Union[StatGroupUsage, None]
    rating: StatGroupRating

stat_groups: dict[str, StatGroup] = {
    "qb": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "passAtt",
            "minimize": "rushAtt",
            "limit": 1
        },
        "rating": {
            'qb': 1.0,
            'rb': 0.25,
            'wr': 0.0 
        }
    },
    "wr": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "recAtt",
            "minimize": "rushAtt",
            "limit": 3
        },
        "rating": {
            'qb': 0.0,
            'rb': 0.25,
            'wr': 1.0 
        }
    },
    "rb": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "rushAtt",
            "minimize": "recAtt",
            "limit": 2
        },
        "rating": {
            'qb': 0.0,
            'rb': 1.0,
            'wr': 0.25 
        }
    },
    "passing": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "passAtt",
            "minimize": "rushAtt",
            "limit": None
        },
        "rating": {
            'qb': 1.0,
            'rb': 0.0,
            'wr': 0.0 
        }
    },
    "receiving": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "recAtt",
            "minimize": "rushAtt",
            "limit": None
        },
        "rating": {
            'qb': 0.0,
            'rb': 0.0,
            'wr': 1.0 
        }
    },
    "rushing": {
        "usage": {
            "groupby": "playerDisplay",
            "maximize": "rushAtt",
            "minimize": "recAtt",
            "limit": None
        },
        "rating": {
            'qb': 0.0,
            'rb': 1.0,
            'wr': 0.0 
        }
    },
    "team": {
        "usage": None,
        "rating": {
            'qb': 1.0,
            'rb': 1.0,
            'wr': 1.0 
        }
    }
}

def each_role(cb):
    rtn = []

    for group, stat_info in stat_groups.items():
        usage = stat_info['usage']

        if usage is not None and 'limit' in usage and usage['limit'] is not None:
            for i in range(usage['limit']):
                rtn.append(cb(group+str(i+1), group, stat_info))
        else:
            rtn.append(cb(group, group, stat_info))
    
    return rtn

player_roles = each_role(lambda role, _, __: role)

stat_aggregates: dict[str, list[str]] = {
    'starters': ['qb', 'wr', 'rb'],
    'usage': ['passing', 'receiving', 'rushing'],
}

def each_group_role(group, cb) -> dict:
    rtn = {}

    stat_info = stat_groups[group]
    usage = stat_groups[group]['usage']

    if usage is not None and 'limit' in usage and usage['limit'] is not None:
        for i in range(usage['limit']):
            role = group+str(i+1)
            rtn[role] = cb(role, group, stat_info)
    else:
        rtn[group] = cb(group, group, stat_info)

    return rtn

def each_aggregate_role(agg, cb):
    groups = stat_aggregates[agg]

    rtn = []
    for group in groups:
        res = each_group_role(group, cb)
        
        rtn = rtn + list(res.values())

    return rtn

def each_aggregate(agg_cb, group_cb):
    return {
        agg: agg_cb(each_aggregate_role(agg, group_cb))
        for agg in stat_aggregates.keys()
    }

def each_comparison(agg_cb, group_cb):
    rtn = {}

    for group in stat_groups.keys():
        rtn.update(each_group_role(group, group_cb))

    rtn.update(each_aggregate(agg_cb, group_cb))

    return rtn

comparisons = list(each_comparison(lambda x: x, lambda role, group, info: role).keys())


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

class SelectRange(Select):
    side: str
    range: int

class SelectWeeks(SelectRange):
    weeks: list[int]


def sanitize_selector(selector: Union[SelectRange, SelectWeeks]):
    if selector["team"] in team_alias:
        selector["team"] = team_alias[selector["team"]]


class SimpleAccess:
    def __init__(
        self,
        storage_path: str,
        clean_up=None,
        team_filter: Callable[
            [pd.DataFrame, Select], Any
        ] = lambda df, s: df["team"] == s["team"],
    ):
        self.df = pd.read_parquet(storage_path).sort_values(
            by=["season", "week"], ascending=False
        )
        self.team_filter = team_filter

        if clean_up is not None:
            clean_up(self.df)

    def get_frame(self) -> pd.DataFrame:
        return self.df
    
    def access_week(self, selector: SelectRange) -> pd.DataFrame:
        sanitize_selector(selector)

        return self.df[
            (self.df["season"] == selector["season"])
            & (self.df["week"] == selector["week"])
            & self.team_filter(self.df, selector)
        ]

    def access_history(self, selector: SelectWeeks) -> pd.DataFrame:
        sanitize_selector(selector)

        query = (self.df["season"] == selector["season"]) & self.team_filter(self.df, selector)
        weeks = None
        for w in selector['weeks']:
            filter = (self.df["week"] == w)
            if weeks is None:
                weeks = filter
            else:
                weeks =  weeks | filter

        query = query & weeks

        return self.df[query]


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
    frames: dict[str, pd.DataFrame]
    def __init__(
        self,
        path_template: str,
        access: Callable[[SelectRange], pd.DataFrame],
    ):
        registry.append(self)

        self.access = access
        self.frames = {}
        self.path_template = path_template

    def get_frame(self, selector: SelectRange) -> pd.DataFrame:
        path = os.path.abspath(self.path_template.format(**selector))

        if path in self.frames:
            return self.frames[path]
        else:
            try:
                df = pd.read_parquet(path)
            except:
                df = pd.DataFrame()

            self.frames[path] = df

            return df

    def update(self, selector: SelectRange, input: pd.DataFrame) -> None:
        path = os.path.abspath(self.path_template.format(**selector))

        self.frames[path] = pd.concat([self.frames[path], input])


    def save(self):
        for path, frame in self.frames.items():
            frame.reset_index(inplace=True, drop=True)
            frame.to_parquet(path)

    def access_week(self, selector: SelectRange) -> pd.DataFrame:
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

            if rtn is None:
                return None

            rtn['season'] = selector['season']
            rtn['week'] = selector['week']
            rtn['team'] = selector['team']
                
            self.update(selector, rtn)
        except NoOpponent as ex:
            rtn = pd.DataFrame()

        return rtn

    def access_history(self, selector: SelectWeeks) -> pd.DataFrame:
        sanitize_selector(selector)

        if len(selector['weeks']) == 0:
            raise Exception('no weeks passed: '+str(selector))
        
        return pd.concat(
            list(filter(lambda row: row is not None, [
                self.access_week(
                    {
                        "season": selector["season"],
                        "week": w,
                        "range": selector["range"],
                        "team": selector["team"],
                        "side": selector["side"],
                    }
                )
                for w in selector['weeks']
            ]))
        )

    def access_across(self, selector: SelectRange) -> pd.DataFrame:
        sanitize_selector(selector)

        others = list(set(team_alias.values()))
        others.remove(selector["team"])
        
        return pd.concat(
            list(filter(lambda row: row is not None, [
                self.access_week(
                    {
                        "season": selector["season"],
                        "week": selector["week"],
                        "range": selector["range"],
                        "team": team,
                        "side": selector["side"],
                    }
                )
                for team in others
            ]))
        )
