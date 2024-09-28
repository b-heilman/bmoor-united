import os
import pandas as pd
import pathlib

base_dir = str(pathlib.Path(__file__).parent.resolve())

def prepare_player_df(df):
    df['week'] = pd.to_numeric(df['week'])
    df['played'] = 1

    return df

player_df = None
def get_players_df() -> pd.DataFrame:
    global player_df

    if player_df is None:
        parquet_path = os.path.abspath(base_dir+'/../cache/parquet/players.parquet')

        player_df = prepare_player_df(pd.read_parquet(parquet_path))
    
    return player_df

game_df = None
def get_game_df() -> pd.DataFrame:
    global game_df

    if game_df is None:
        parquet_path = os.path.abspath(base_dir+'/../cache/parquet/games.parquet')

        game_df = pd.read_parquet(parquet_path)\
            .sort_values(by=['season', 'week'], ascending=False)
    
    return game_df

def reduce_by_pos(
    team_season_df: pd.DataFrame, 
    gt: str = 'recAtt', 
    lt: str = 'rushAtt',
    unique_field: str = 'playerDisplay',
    ignore_field: str = 'playerPositionNorm',
    ignore_values: list[str] = ['qb']
):
    usage = team_season_df.groupby(unique_field).agg({
        gt: 'sum',
        lt: 'sum',
        ignore_field: 'last'
    })

    group_df = usage[(usage[gt] > usage[lt]) & ~(usage[ignore_field].isin(ignore_values))]

    targets = list(group_df.index)

    return team_season_df[team_season_df[unique_field].isin(targets)]

def get_top(
    team_season_df: pd.DataFrame, 
    start: int, 
    depth: int, 
    count: int = 3,
    sort_field: str='recAtt',
    rtn_field: str='playerDisplay', 
    blank_on_fail: bool=False
) -> dict:
    
    search = team_season_df[(team_season_df['week'] <= start) & (team_season_df['week'] > start - depth)]
    
    info = search.groupby(rtn_field).agg({
        'played': 'count',
        sort_field: 'sum'
    })

    info['att/g'] = info[sort_field] / info['played']

    info = info.sort_values(by=['att/g'], ascending=False).head(3)

    if len(info.index) == 0:
        if blank_on_fail:
            return {}
        else:
            return get_top(
                team_season_df, 
                start, 
                depth, 
                count,
                sort_field,
                rtn_field, 
                blank_on_fail = True
            )
    else:
        rtn = {}
        for i in range(min(count, len(info.index))):
            rtn[info.index[i]] = count - i
        
        return rtn

def join_rank(base_dict: dict, add_dict: dict) -> dict:
    for key, value in add_dict.items():
        if key in base_dict:
            base_dict[key] += value
        else:
            base_dict[key] = value

    return base_dict

def get_rank(
    team_season_df: pd.DataFrame, 
    week: int, 
    count: int=3, 
    sort_field: str='recAtt',
    rtn_field: str='playerDisplay',
) -> dict:
    res = join_rank(
        get_top(team_season_df, week, 1, count, sort_field, rtn_field),
        join_rank(
            get_top(team_season_df, week, 3, count, sort_field, rtn_field),
            get_top(team_season_df, week, 5, count, sort_field, rtn_field),
        )
    )

    return dict(sorted(res.items(), key=lambda item: item[1], reverse=True)[0:count])

#def encode_players(
#    player_df: pd.DataFrame, 
#    refs: list[str], 
#    ref_field: str='playerDisplay'
#):

def smart_reduce(
    team_season_df: pd.DataFrame,
    week: int,
    gt: str,
    lt: str,
    ignore_values: list[str] = ['qb']
) -> pd.DataFrame:
    # reduce only to available players 
    reduced_df = reduce_by_pos(
        team_season_df, 
        gt,
        lt,
        ignore_values=ignore_values
    )

    allowed = reduced_df[reduced_df['week'] == week]['playerDisplay'].unique()
    
    return reduced_df[reduced_df['playerDisplay'].isin(allowed)]

def select_top_recievers(
    team_season_df: pd.DataFrame, 
    week: int, 
    count=3
) -> list[str]:
    """
    Return back embeddings representing receivers
    """
    # reduce only to available players 
    reduced_df = smart_reduce(
        team_season_df, 
        week,
        gt="recAtt", 
        lt="rushAtt"
    )
    
    return list(get_rank(
        reduced_df, 
        week,
        count,
        sort_field="recAtt",
        rtn_field='playerDisplay'
    ).keys())

def select_top_rushers(
    team_season_df: pd.DataFrame, 
    week: int, 
    count=2
) -> list[str]:
    """
    Return back embeddings representing rushers
    """
    reduced_df = smart_reduce(
        team_season_df, 
        week,
        gt="rushAtt", 
        lt="recAtt"
    )
    
    return list(get_rank(
        reduced_df, 
        week,
        count,
        sort_field="rushAtt",
        rtn_field='playerDisplay'
    ).keys())

def select_quarterback(
    team_season_df: pd.DataFrame, 
    week: int, 
    count=1
) -> list[str]:
    """
    Return back embeddings representing starting qb
    """
    reduced_df = smart_reduce(
        team_season_df, 
        week,
        gt="passAtt", 
        lt="rushAtt",
        ignore_values=['wr','rb']
    )
    
    return list(get_rank(
        reduced_df, 
        week,
        count,
        sort_field="passAtt",
        rtn_field='playerDisplay'
    ).keys())

advanced_off_df = None
advanced_parquet_path = os.path.abspath(base_dir+'/../cache/parquet/advancedOff.parquet')
def get_advanced_off_df() -> pd.DataFrame:
    global advanced_off_df

    if advanced_off_df is None:
        if os.path.exists(advanced_parquet_path):
            advanced_off_df = pd.read_parquet(advanced_parquet_path)
        else:
            advanced_off_df = pd.DataFrame()
    
    return advanced_off_df

def add_advanced_off_df(add_df):
    global advanced_off_df

    advanced_off_df = pd.concat([advanced_off_df, add_df])

def save_advanced_off_df():
    global advanced_off_df

    advanced_off_df.reset_index(inplace=True, drop=True)

    advanced_off_df.to_parquet(advanced_parquet_path)

stats_roles = [
    'wr1',
    'wr2',
    'wr3',
    'rb1',
    'rb2',
    'qb1'
]

stats_fields = [
    'passCmp',
    'passAtt',
    'passYds',
    'passTd',
    'passInt',
    'passLong',
    'passRating',
    'passTargetYds',
    # passPoor_throws": number,
    # passBlitzed: number,
    # passHurried: number,
    # passScrambles: number,
    'rushAtt',
    'rushYds',
    'rushTd',
    'rushLong',
    'rushYdsBc',
    'rushYdsAc',
    'rushBrokenTackles',
    'recAtt',
    'recCmp', 
    'recYds',
    'recTd',
    'recDrops',
    'recLong',
    'recDepth',
    'recYac',
    'sacked',
    'fumbles',
    'fumblesLost'
]

fake_label = '--fake--'
def get_blank_stats(count: int) -> pd.DataFrame:
    zeroed = {stat : 0 for stat in stats_fields}
    zeroed['playerDisplay'] = fake_label
    return pd.DataFrame([zeroed] * count)

def get_players_history(team_season_df, week, player):
    return team_season_df[
        (team_season_df['playerDisplay'] == player) &  (team_season_df['week'] <= week)
    ]

def get_players_stats(team_season_df, players: list[str]) -> pd.DataFrame:
    base = team_season_df[team_season_df['playerDisplay'].isin(players)]

    if len(base.index) == 0:
        return None
    
    rtn = base.groupby('playerDisplay')\
        .agg({stat : 'mean' for stat in stats_fields})\
        .reindex(index = players).reset_index()

    return rtn

rest_label = 'rest'
def get_team_stats(team_season_df: pd.DataFrame, ignore_players: list[str]) -> pd.Series:
    rest_series = team_season_df[
        ~(team_season_df['playerDisplay'].isin(ignore_players))
    ].groupby('week').agg({stat : 'sum' for stat in stats_fields}).mean()
    
    rest_series['playerDisplay'] = rest_label
    rest_series['role'] = 'rest'

    return pd.DataFrame([rest_series])

def get_opponent_schedule(season, week, team):
    games_df = get_game_df()
    season_df = games_df[(games_df['season'] == int(season)) & (games_df['week'] <= int(week))]
    team_df = season_df[(season_df['homeTeamDisplay'] == team) | (season_df['awayTeamDisplay'] == team)]

    def reduce_row(row):
        return {
            'season': row['season'],
            'week': row['week'],
            'opponent': row['homeTeamDisplay'] \
                if row['homeTeamDisplay'] != team else row['awayTeamDisplay']
        }
    
    return list(team_df.apply(reduce_row, axis=1))

def get_week_stats(season, week, team) -> pd.DataFrame:
    player_df = get_players_df()

    return player_df[
        (player_df['season'] == season) & \
        (player_df['week'] == week) & \
        (player_df['teamDisplay'] == team)
    ]

def get_opponent_stats(season, week, team) -> pd.DataFrame:
    opponent_df = map(
        lambda game: get_week_stats(game['season'], game['week'], game['opponent']),
        get_opponent_schedule(season, week, team)
    )

    return pd.concat(opponent_df)
    
def get_advanced_off_stats(season, week, team) -> pd.DataFrame:
    """
    For every week, calculate the top players by position by attempt
    """
    advanced_off_df = get_advanced_off_df()

    if (len(advanced_off_df.index) > 0):
        res_df = advanced_off_df[
            (advanced_off_df['season'] == season) & \
            (advanced_off_df['week'] == week) & \
            (advanced_off_df['team'] == team)
        ]

        if len(res_df.index) != 0:
            return res_df

    player_df = get_players_df()

    season_df = player_df[(player_df['season'] == int(season)) & (player_df['week'] <= int(week))]
    team_season_df = season_df[(season_df['teamDisplay'] == str(team))]

    top_receivers = select_top_recievers(team_season_df, week, 3)
    receivers_df = get_players_stats(team_season_df, top_receivers)
    if len(top_receivers) < 3:
        receivers_df = pd.concat([receivers_df, get_blank_stats(3 - len(top_receivers))])
    receivers_df['playerPosition'] = 'wr'

    top_rushers = select_top_rushers(team_season_df, week, 2)
    rushers_df = get_players_stats(team_season_df, top_rushers)
    if len(top_rushers) < 2:
        rushers_df = pd.concat([rushers_df, get_blank_stats(2 - len(top_rushers))])
    rushers_df['playerPosition'] = 'rb'

    top_qb = select_quarterback(team_season_df, week, 1)
    qb_df = get_players_stats(team_season_df, top_qb)
    if len(top_qb) < 1:
        qb_df = get_blank_stats(1)
    qb_df['playerPosition'] = 'qb'
    
    stats_df = pd.concat([receivers_df, rushers_df, qb_df])

    stats_df['role'] = stats_roles

    rest_df = get_team_stats(team_season_df, top_receivers + top_rushers + top_qb)
    stats_df = pd.concat([stats_df, rest_df])

    stats_df['season'] = season
    stats_df['week'] = week
    stats_df['team'] = team

    add_advanced_off_df(stats_df)

    return stats_df

def get_role_week(season, week, team, role):
    adv = get_advanced_off_stats(season, week, team)

    roles = adv.set_index('role')
    player = roles.loc[role]

    player_df = get_players_df()
    
    return player_df[
        (player_df['season'] == int(season)) & 
        (player_df['week'] == int(week)) &
        (player_df['teamDisplay'] == team) &
        (player_df['playerDisplay'] == player['playerDisplay'])
    ].iloc[0]

def get_role_history(season, week, team, role):
    adv = get_advanced_off_stats(season, week, team)

    roles = adv.set_index('role')
    player = roles.loc[role]

    player_df = get_players_df()
    
    return player_df[
        (player_df['season'] == int(season)) & 
        (player_df['week'] <= int(week)) &
        (player_df['teamDisplay'] == team) &
        (player_df['playerDisplay'] == player['playerDisplay'])
    ][stats_fields].mean()

defensive_df = None
def_parquet_path = os.path.abspath(base_dir+'/../cache/parquet/defensive.parquet')
def get_defensive_df() -> pd.DataFrame:
    global defensive_df

    if defensive_df is None:
        if os.path.exists(def_parquet_path):
            defensive_df = pd.read_parquet(def_parquet_path)
        else:
            defensive_df = pd.DataFrame()
    
    return defensive_df

def add_defensive_df(add_df):
    global defensive_df

    defensive_df = pd.concat([defensive_df, add_df])

def save_defensive_df():
    global defensive_df

    defensive_df.reset_index(inplace=True, drop=True)

    defensive_df.to_parquet(def_parquet_path)

def _compute_early_def_stats(season, week, team) -> pd.DataFrame:
    # if we are in week one, so we don't have priors, instead we will use
    # the league average for the role

    # get my opponent for the week
    schedule = get_opponent_schedule(season, week, team)
    this_week = schedule.pop(0)

    # current_df = get_week_stats(season, week, this_week['opponent'])
    advanced_df = get_advanced_off_stats(season, week, this_week['opponent'])

    player_df = get_players_df()
    teams = player_df[
        (player_df['season'] == season) & 
        (player_df['week'] == week) &
        (player_df['teamDisplay'] != team)
    ]['teamDisplay'].unique()

    advanced_aggs = [get_advanced_off_stats(season, week, team) for team in teams]

    others_df = pd.concat(advanced_aggs).groupby('role')\
        .agg({stat : 'mean' for stat in stats_fields})
    # print(others_df)
    res = []
    for role in stats_roles:
        others_results = pd.DataFrame([others_df.loc[role]])
        advanced_results = advanced_df.loc[advanced_df['role'] == role]

        diff = pd.concat([
            others_results[stats_fields],
            advanced_results[stats_fields]
        ]).diff().iloc[1]

        diff['playerDisplay'] = advanced_results.iloc[0]['playerDisplay']
        diff['role'] = role

        res.append(diff)

    return pd.DataFrame(res)

def _compute_later_def_stats(season, week, team) -> pd.DataFrame:
    # get all the 
    # priors = get_defensive_stats(season, prev_week, team)
    player_df = get_players_df()

    # get my opponent for the last week
    schedule = get_opponent_schedule(season, week, team)
    this_week = schedule.pop(0)
    opponent = this_week['opponent']

    prior_season_df = player_df[(player_df['season'] == int(season)) & (player_df['week'] < int(week))]
    team_season_df = prior_season_df[(prior_season_df['teamDisplay'] == str(opponent))]

    # get the advanced_off stats for my opponent average stats for last week
    roles = get_advanced_off_stats(season, week, opponent)[['playerDisplay', 'role', 'playerPosition']].copy()
    roles.reset_index(inplace=True)

    current_df = get_week_stats(season, week, opponent)
    
    # remove fills
    fake_index = roles[roles['playerDisplay'] == fake_label].index
    roles.drop(fake_index , inplace=True)
    
    # remove rest from results
    rest_index = roles[roles['playerDisplay'] == rest_label].index
    roles.drop(rest_index , inplace=True)
    
    # compute how much I changed from their average
    res = []
    for index, row in roles.iterrows():
        player = row['playerDisplay']
        prior_results = get_players_stats(team_season_df, [player])
        current_results = current_df.loc[current_df['playerDisplay'] == player]

        if prior_results is None:
            sub_team_season_df = team_season_df[
                team_season_df['playerPosition'] == row['playerPosition']
            ]
            prior_results = get_team_stats(sub_team_season_df, roles['playerDisplay'])

        diff = pd.concat([
            prior_results[stats_fields],
            current_results[stats_fields]
        ]).diff().iloc[1]

        diff['playerDisplay'] = player
        diff['role'] = row['role']

        res.append(diff)

    # compute the rest
    prior_results = get_team_stats(team_season_df, roles['playerDisplay'])
    current_results = get_team_stats(current_df, roles['playerDisplay'])
    
    diff = pd.concat([
        prior_results[stats_fields],
        current_results[stats_fields]
    ]).diff().iloc[1]
    
    diff['playerDisplay'] = rest_label
    diff['role'] = 'rest'
    
    res.append(diff)

    return pd.DataFrame(res)

def get_defensive_stats(season, week, team) -> pd.DataFrame:
    """
    I want to calculate the effects we have for each abstraction position
    """
    defensive_df = get_defensive_df()

    if (len(defensive_df.index) > 0):
        res_df = defensive_df[
            (defensive_df['season'] == season) & \
            (defensive_df['week'] == week) & \
            (defensive_df['team'] == team)
        ]

        if len(res_df.index) != 0:
            return res_df
    
    if week == 1:
        res_df = _compute_early_def_stats(season, week, team)
    else:
        res_df = _compute_later_def_stats(season, week, team)    
    
    res_df['season'] = season
    res_df['week'] = week
    res_df['team'] = team

    # save data
    add_defensive_df(res_df)

    return res_df
        
def get_all_games() -> pd.DataFrame:
    player_df = get_players_df()

    return player_df[['season', 'week', 'teamDisplay']].drop_duplicates()

if __name__ == "__main__":
    get_advanced_off_df()
    get_defensive_df()

    for index, row in get_all_games().sort_values(by=['season', 'week'], ascending=False).iterrows():
        print('processing > ', row['season'], row['week'], row['teamDisplay'])
        get_defensive_stats(row['season'], row['week'], row['teamDisplay'])

        if index % 100 == 0:
            save_advanced_off_df()
            save_defensive_df()

    save_advanced_off_df()
    save_defensive_df()