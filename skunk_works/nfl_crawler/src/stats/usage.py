import numpy as np
import pandas as pd
import pathlib

# from typing import Callable, TypedDict, Any, Union

from .games import get_opponent, raw_players, get_schedule
from .common import (
    stat_fields, 
    stat_groups,
    player_roles,
    SelectRange,
    ComputeAccess,
    StatGroupUsage
)

base_dir = str(pathlib.Path(__file__).parent.resolve())

def top_usage(
    team_df: pd.DataFrame,
    usage: StatGroupUsage,
) -> list[str]:
    filtered_df = team_df[
        (team_df[usage['maximize']] > team_df[usage['minimize']])
    ]

    search = filtered_df.copy()

    if 'limit' in usage and usage['limit'] is not None:
        search["played"] = 1
    
        info = search.groupby(usage["groupby"]).agg({
            "played": "sum", 
            usage['maximize']: "sum"
        })

        info["maxed/g"] = info[usage['maximize']] / info["played"]

        info = info.sort_values(by=["maxed/g"], ascending=False).head(usage['limit'])
        
        info.reset_index(inplace=True)

        rtn = []
        for i in range(min(usage['limit'], len(info.index))):
            rtn.append(info.iloc[i][usage['groupby']])
    else:
        rtn = list(search[usage['groupby']].unique())

    return rtn


stats_fake_display = "--fake--"
stats_rest_display = "aggregate"


# get_blank_stats
def stats_fake(count: int) -> pd.DataFrame:
    zeroed: dict[str, str | int] = {stat: 0 for stat in stat_fields}
    zeroed["playerDisplay"] = stats_fake_display

    return pd.DataFrame([zeroed] * count)


def stats_offense(
    search_df: pd.DataFrame,
    players: list[str],
    include: bool = True,
) -> pd.DataFrame:
    if include:
        base = search_df[search_df["playerDisplay"].isin(players)]
    else:
        base = search_df[~search_df["playerDisplay"].isin(players)]

    if len(base.index) == 0:
        return pd.DataFrame()

    rtn = base.groupby("playerDisplay").agg({stat: "mean" for stat in stat_fields})

    if include:
        return rtn.reindex(index=players).reset_index()
    else:
        return rtn.reindex(index=base["playerDisplay"].unique()).reset_index()


def compute_player_usage(selector: SelectRange):
    if selector['week'] == 0:
        print('punting', selector)
        raise Exception('Searching for week 0: '+str(selector))
    
    if selector["side"] == "def":
        opp = get_opponent(selector)

        return player_usage.access_week(
            {
                "season": selector["season"],
                "week": selector["week"],
                "range": selector["range"],
                "team": opp,
                "side": "off",
            }
        ).copy()
    else:
        agg = []
        weeks = get_schedule({
            "season": selector["season"],
            "week": selector["week"],
            "range": selector["range"],
            "team": selector["team"],
            "side": selector["side"],
        })

        # If a team missed a game in the first week, this may be needed
        if len(weeks) == 0:
            return None
        
        team_season_df = raw_players.access_history({
            "season": selector["season"],
            "week": selector["week"],
            "range": selector["range"],
            "team": selector["team"],
            "side": selector["side"],
            "weeks": weeks
        })
        team_week = team_season_df[team_season_df["week"] == selector["week"]]

        team_season_df = team_season_df[
            team_season_df['playerDisplay'].isin(team_week['playerDisplay'].unique())
        ]

        for group, stat_info in stat_groups.items():
            usage = stat_info['usage']
            if usage is None:
                top_df = pd.DataFrame([team_week[stat_fields].sum()])
                top_df['role'] = group
                top_df['playerDisplay'] = 'team'
            else:
                tops = top_usage(team_season_df, usage)
                top_df = stats_offense(team_week, tops)

                if 'limit' in usage and usage['limit'] is not None:
                    if len(top_df) < usage['limit']:
                        top_df = pd.concat([top_df, stats_fake(usage['limit'] - len(tops))])

                    top_df = top_df[stat_fields+['playerDisplay']]
                    top_df['role'] = [group+str(i+1) for i in range(usage['limit'])]
                else:
                    top_df = pd.DataFrame([top_df[stat_fields].sum()])
                    top_df['playerDisplay'] = 'aggregate_'+group
                    top_df['role'] = group
                
            top_df['group'] = group
            agg.append(top_df)

        return pd.concat(agg)


player_usage = ComputeAccess(
    base_dir + "/../../cache/parquet/{side}_{range}_usage.parquet",
    compute_player_usage,
)


def compute_player_usage_delta(selector: SelectRange):
    """
    For every week, calculate the top players by position by attempt
    """
    # get this week
    this_week_df = player_usage.access_week(selector)
    
    if len(this_week_df.index) == 0:
        # We are asking for a week that isn't needed
        return pd.DataFrame()
    
    indexed_week_df = this_week_df.set_index("role")[
        [stat for stat in stat_fields]
    ]
    
    # get the historical average
    if selector["week"] == 1:
        # if we're on week one, we will compare to everyone else
        history_df = (
            player_usage.access_across({
                "season": selector['season'],
                "range": selector['range'],
                "week": selector["week"],
                "team": selector['team'],
                "side": selector["side"]
            })
            .groupby("role")
            .agg({stat: "mean" for stat in stat_fields})
        )
    else:
        opponent = get_opponent(selector)
        weeks = get_schedule({
            "season": selector["season"],
            "week": selector["week"],
            "range": selector["range"],
            "team": opponent,
            "side": "def" if selector["side"] == "off" else "off",
        })

        history_df = (
            player_usage.access_history({
                "season": selector["season"],
                "week": selector["week"],
                "range": selector["range"],
                "team": opponent,
                "side": "def" if selector["side"] == "off" else "off",
                "weeks": weeks
            })
            .groupby("role")
            .agg({stat: "mean" for stat in stat_fields})
        )

    # compute the change off of the average for the role
    try:
        delta_df = pd.DataFrame(
            indexed_week_df.loc[role] - history_df.loc[role] for role in player_roles
        )
    except Exception as ex:
        print('>>>> usage - frames -> failed on: '+str(selector))
        print(indexed_week_df)
        print(history_df)
        raise ex

    delta_df["role"] = player_roles
    delta_df.set_index("role", inplace=True)

    full_index = this_week_df.set_index("role")
    delta_df["playerDisplay"] = [
        full_index.loc[role]['playerDisplay'] for role in player_roles
    ]

    delta_df.reset_index(inplace=True)

    return delta_df


player_usage_deltas = ComputeAccess(
    base_dir + "/../../cache/parquet/{side}_{range}_usage_delta.parquet",
    compute_player_usage_delta,
)
