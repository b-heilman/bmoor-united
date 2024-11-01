import pandas as pd
import pathlib

from .games import get_opponent, raw_players
from .common import player_roles, stat_fields, SelectSide, ComputeAccess

base_dir = str(pathlib.Path(__file__).parent.resolve())


def team_filter_by_usage(
    team_df: pd.DataFrame,
    gt: str = "recAtt",
    lt: str = "rushAtt",
    unique_field: str = "playerDisplay",
    ignore_field: str = "playerPositionNorm",
    ignore_values: list[str] = ["qb"],
) -> pd.DataFrame:
    usage = team_df.groupby(unique_field).agg(
        {gt: "sum", lt: "sum", ignore_field: "last"}
    )

    group_df = usage[
        (usage[gt] > usage[lt]) & ~(usage[ignore_field].isin(ignore_values))
    ]

    targets = list(group_df.index)

    return team_df[team_df[unique_field].isin(targets)]


def team_sort_by_usage(
    team_df: pd.DataFrame,
    start: int = 0,
    count: int = 3,
    sort_field: str = "recAtt",
    rtn_field: str = "playerDisplay",
    blank_on_fail: bool = False,
) -> dict:
    search = team_df[(team_df["week"] > start)].copy()
    search["played"] = 1

    info = search.groupby(rtn_field).agg({"played": "count", sort_field: "sum"})

    info["att/g"] = info[sort_field] / info["played"]

    info = info.sort_values(by=["att/g"], ascending=False).head(count)

    if len(info.index) == 0:
        if blank_on_fail or start <= 0:
            return {}
        else:
            return team_sort_by_usage(
                team_df, start - 1, count, sort_field, rtn_field, blank_on_fail=True
            )
    else:
        rtn = {}
        for i in range(min(count, len(info.index))):
            rtn[info.index[i]] = count - i

        return rtn


def team_usage(
    team_df: pd.DataFrame,
    week: int,
    gt: str,
    lt: str,
    ignore_values: list[str] = ["qb"],
) -> pd.DataFrame:
    # reduce only to available players
    usage_df = team_filter_by_usage(team_df, gt, lt, ignore_values=ignore_values)

    allowed = usage_df[usage_df["week"] == week]["playerDisplay"].unique()

    return usage_df[usage_df["playerDisplay"].isin(allowed)]


def stats_sort_recievers(team_df: pd.DataFrame, week: int, count=3) -> list[str]:
    """
    Return back embeddings representing receivers
    """
    # reduce only to available players
    reduced_df = team_usage(team_df, week, gt="recAtt", lt="rushAtt")

    return list(
        team_sort_by_usage(
            reduced_df, week, count, sort_field="recAtt", rtn_field="playerDisplay"
        ).keys()
    )


def stats_sort_rushers(team_df: pd.DataFrame, week: int, count=2) -> list[str]:
    """
    Return back embeddings representing rushers
    """
    reduced_df = team_usage(team_df, week, gt="rushAtt", lt="recAtt")

    return list(
        team_sort_by_usage(
            reduced_df, week, count, sort_field="rushAtt", rtn_field="playerDisplay"
        ).keys()
    )


def stats_sort_quarterback(team_df: pd.DataFrame, week: int, count=1) -> list[str]:
    """
    Return back embeddings representing starting qb
    """
    reduced_df = team_usage(
        team_df, week, gt="passAtt", lt="rushAtt", ignore_values=["wr", "rb"]
    )

    return list(
        team_sort_by_usage(
            reduced_df, week, count, sort_field="passAtt", rtn_field="playerDisplay"
        ).keys()
    )


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
    aggregate: bool = False,
) -> pd.DataFrame:
    if include:
        base = search_df[search_df["playerDisplay"].isin(players)]
    else:
        base = search_df[~search_df["playerDisplay"].isin(players)]

    if len(base.index) == 0:
        return pd.DataFrame()

    if aggregate:
        rtn_series = (
            base.groupby("week").agg({stat: "sum" for stat in stat_fields}).mean()
        )

        rtn = pd.DataFrame([rtn_series])
        rtn["playerDisplay"] = stats_rest_display

        return rtn.set_index("playerDisplay").reset_index()
    else:
        rtn = base.groupby("playerDisplay").agg({stat: "mean" for stat in stat_fields})

        if include:
            return rtn.reindex(index=players).reset_index()
        else:
            return rtn.reindex(index=base["playerDisplay"].unique()).reset_index()


def compute_player_usage(selector: SelectSide):
    if selector["side"] == "def":
        opp = get_opponent(selector)

        return player_usage.access_week(
            {
                "season": selector["season"],
                "week": selector["week"],
                "team": opp,
                "side": "off",
            }
        ).copy()
    else:
        team_season_df = raw_players.access_history(selector)
        team_week = team_season_df[team_season_df["week"] == selector["week"]]
        week = selector["week"]

        top_receivers = stats_sort_recievers(team_season_df, week, 3)
        receivers_df = stats_offense(team_week, top_receivers)

        if len(top_receivers) < 3:
            receivers_df = pd.concat([receivers_df, stats_fake(3 - len(top_receivers))])
        receivers_df["playerPosition"] = "wr"

        top_rushers = stats_sort_rushers(team_season_df, week, 2)
        rushers_df = stats_offense(team_week, top_rushers)
        if len(top_rushers) < 2:
            rushers_df = pd.concat([rushers_df, stats_fake(2 - len(top_rushers))])
        rushers_df["playerPosition"] = "rb"

        top_qbs = stats_sort_quarterback(team_season_df, week, 1)
        qb_df = stats_offense(team_week, top_qbs)
        if len(top_qbs) < 1:
            qb_df = stats_fake(1)
        qb_df["playerPosition"] = "qb"

        stats_df = pd.concat([receivers_df, rushers_df, qb_df])

        if len(top_receivers + top_rushers + top_qbs) == 0:
            # I'm not sure how this was happening.  I might need to remove it and see what breaks again
            # theoretically this should never be possible
            rest_df = stats_fake(1)
        else:
            rest_df = stats_offense(
                team_week,
                top_receivers + top_rushers + top_qbs,
                include=False,
                aggregate=True,
            )

            # If the team was so bad that no one helped, we gotta add junk data
            if len(rest_df.index) == 0:
                rest_df = stats_fake(1)

        rest_df["playerPosition"] = "rest"

        roles_df = pd.concat([stats_df, rest_df])

        roles_df["role"] = player_roles

        return roles_df


player_usage = ComputeAccess(
    base_dir + "/../../cache/parquet/off_usage.parquet",
    base_dir + "/../../cache/parquet/def_usage.parquet",
    compute_player_usage,
)


def compute_player_usage_delta(selector: SelectSide):
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
    
    if len(player_roles) != len(indexed_week_df.index):
        player_usage.save()
        print('>>>> usage - debug', selector)
        print(indexed_week_df)
        print('? sanity')
        print(player_usage.access_week(selector))
        raise Exception('>>>> usage - access_week - conflict of roles -> '+str(selector))
    
    # get the historical average
    if selector["week"] == 1:
        # if we're on week one, we will compare to everyone else
        history_df = (
            player_usage.access_across(selector)
            .groupby("role")
            .agg({stat: "mean" for stat in stat_fields})
        )
    else:
        opponent = get_opponent(selector)

        history_df = (
            player_usage.access_history(
                {
                    "season": selector["season"],
                    "week": selector["week"] - 1,
                    "team": opponent,
                    "side": "def" if selector["side"] == "off" else "off",
                }
            )
            .groupby("role")
            .agg({stat: "mean" for stat in stat_fields})
        )

    # compute the change off of the average for the role
    try:
        delta_df = pd.DataFrame(
            [indexed_week_df.loc[role] - history_df.loc[role] for role in player_roles]
        )
    except Exception as ex:
        print('>>>> usage - frames -> failed on: '+str(selector))
        print(indexed_week_df)
        print(history_df)
        raise ex

    delta_df["role"] = player_roles

    return delta_df


player_usage_deltas = ComputeAccess(
    base_dir + "/../../cache/parquet/off_usage_delta.parquet",
    base_dir + "/../../cache/parquet/def_usage_delta.parquet",
    compute_player_usage_delta,
)
