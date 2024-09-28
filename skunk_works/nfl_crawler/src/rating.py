import os
import pandas as pd
import pathlib

from stats import get_defensive_df, get_role_history, get_all_games

base_dir = str(pathlib.Path(__file__).parent.resolve())

def calculate_off_qb_rating(player_row):
    # Step 1: Calculate completion percentage component (a)
    a = ((player_row['passCmp'] / player_row['passAtt']) - 0.3) * 5
    a = max(0, min(a, 2.375))
    
    # Step 2: Calculate yards per attempt component (b)
    b = ((player_row['passYds'] / player_row['passAtt']) - 3) * 0.25
    b = max(0, min(b, 2.375))
    
    # Step 3: Calculate touchdown percentage component (c)
    c = (player_row['passTd'] / player_row['passAtt']) * 20
    c = max(0, min(c, 2.375))
    
    # Step 4: Calculate interception percentage component (d)
    d = 2.375 - ((player_row['passInt'] / player_row['passAtt']) * 25)
    d = max(0, min(d, 2.375))
    
    # Step 5: Combine components and calculate passer rating
    qb_rating = ((a + b + c + d) / 6) * 100
    
    return qb_rating


def calculate_off_rb_rating(player_row):
    # Avoid division by zero
    if player_row['rushAtt'] == 0:
        return 0

    # Step 1: Calculate Yards per Carry (YPC)
    ypc = player_row['rushYds'] / player_row['rushAtt']
    
    # Step 2: Calculate Touchdowns per Carry
    tpc = player_row['rushTd'] / player_row['rushAtt']
    
    # Step 3: Calculate Fumbles per Carry (negative impact)
    fpc = player_row['fumblesLost'] / player_row['rushAtt']
    
    # Step 4: Add Receiving Performance (if applicable)
    if player_row['recCmp'] > 0:
        receiving_effect = (player_row['recYds'] / player_row['recCmp']) + (player_row['recTd'] / player_row['recCmp'])
    else:
        receiving_effect = 0
    
    # Custom weightings can be adjusted based on preference
    # Step 5: Calculate the RB rating (custom formula combining rush and receiving)
    rb_rating = (ypc * 5) + (tpc * 20) - (fpc * 15) + (receiving_effect * 2)
    
    # Ensure a positive rating
    return max(0, rb_rating)


def calculate_off_wr_rating(player_row):
    # Avoid division by zero
    if player_row['recAtt'] == 0 or player_row['recCmp'] == 0:
        return 0

    # Step 1: Calculate Yards per Reception (YPR)
    ypr = player_row['recYds'] / player_row['recCmp']

    # Step 2: Calculate Touchdowns per Reception (Td/R)
    tpr = player_row['recTd'] / player_row['recCmp']

    # Step 3: Calculate Catch Rate (Receptions per Target)
    catch_rate = player_row['recCmp'] / player_row['recAtt']

    # Step 4: Calculate Fumbles per Reception (Negative impact)
    fpr = player_row['fumblesLost'] / player_row['recCmp']

    # Custom weightings can be adjusted based on preference
    # Step 5: Combine metrics into WR rating
    wr_rating = (ypr * 3) + (tpr * 25) + (catch_rate * 20) - (fpr * 10)

    # Ensure the rating is positive
    return max(0, wr_rating)

def calculate_def_rating(attempts, completions, yards, touchdowns, turnovers):
    # Positive score means the defense is good, negative is bad
    
    # if attempts went down, but completions went up, bad for defense 
    # attempts up, completions down, good for defense
    score = (attempts - completions) * 3

    if completions < 0:
        score -= completions * 5

    if attempts < 0:
        score -= attempts * 5

    return score + -(
        + (yards) 
        + (touchdowns * 7)
        - turnovers * 10 
    )

def calculate_def_team_rating(player_row):
    return calculate_def_rating(
        player_row['passAtt'],
        player_row['passCmp'],
        player_row['passYds'],
        player_row['passTd'],
        player_row['passInt']
    ) + calculate_def_rating(
        player_row['rushAtt'],
        player_row['rushAtt'],
        player_row['rushYds'],
        player_row['rushTd'],
        player_row['fumblesLost']
    )

def calculate_def_qb_rating(player_row):
    return calculate_def_rating(
        player_row['passAtt'],
        player_row['passCmp'],
        player_row['passYds'],
        player_row['passTd'],
        player_row['passInt']
    )

def calculate_def_wr_rating(player_row):
    return calculate_def_rating(
        player_row['recAtt'],
        player_row['recCmp'],
        player_row['recYds'],
        player_row['recTd'],
        player_row['fumblesLost']
    )

def calculate_def_rb_rating(player_row):
    return calculate_def_rating(
        player_row['rushAtt'],
        player_row['rushAtt'],
        player_row['rushYds'],
        player_row['rushTd'],
        player_row['fumblesLost']
    )

rating_df = None
rating_parquet_path = os.path.abspath(base_dir+'/../cache/parquet/rating.parquet')
def get_rating_df() -> pd.DataFrame:
    global rating_df

    if rating_df is None:
        if os.path.exists(rating_parquet_path):
            rating_df = pd.read_parquet(rating_parquet_path)
        else:
            rating_df = pd.DataFrame()
    
    return rating_df

def add_rating_df(add_df):
    global rating_df

    rating_df = pd.concat([rating_df, add_df])

def save_rating_df():
    global rating_df

    rating_df.reset_index(inplace=True, drop=True)

    rating_df.to_parquet(rating_parquet_path)

def get_team_rating(season, week, team):
    rating_df = get_rating_df()

    if (len(rating_df.index) > 0):
        res_df = rating_df[
            (rating_df['season'] == season) & \
            (rating_df['week'] == week) & \
            (rating_df['team'] == team)
        ]

        if len(res_df.index) != 0:
            return res_df
        
    defensive_df = get_defensive_df()

    # we want the average rating for that position up to this week
    season_df = defensive_df[
        (defensive_df['season'] == season) &
        (defensive_df['week'] <= week) &
        (defensive_df['team'] == team)
    ]

    roles_df = season_df.groupby(['team', 'role']).mean()\
        .reset_index().set_index('role')

    print(roles_df)
    res = pd.DataFrame([{
        'side': 'def',
        'role': 'qb1',
        'rating': calculate_def_qb_rating(roles_df.loc['qb1'])
    }, {
        'side': 'def',
        'role': 'rb1',
        'rating': calculate_def_rb_rating(roles_df.loc['rb1'])
    }, {
        'side': 'def',
        'role': 'rb2',
        'rating': calculate_def_rb_rating(roles_df.loc['rb2'])
    }, {
        'side': 'def',
        'role': 'wr1',
        'rating': calculate_def_wr_rating(roles_df.loc['wr1'])
    }, {
        'side': 'def',
        'role': 'wr2',
        'rating': calculate_def_wr_rating(roles_df.loc['wr2'])
    }, {
        'side': 'def',
        'role': 'wr3',
        'rating': calculate_def_wr_rating(roles_df.loc['wr3'])
    }, {
        'side': 'off',
        'role': 'qb1',
        'rating': calculate_off_qb_rating(
            get_role_history(season, week, team, 'qb1')
        )
    }, {
        'side': 'off',
        'role': 'rb1',
        'rating': calculate_off_rb_rating(
            get_role_history(season, week, team, 'rb1')
        )
    }, {
        'side': 'off',
        'role': 'rb2',
        'rating': calculate_off_rb_rating(
            get_role_history(season, week, team, 'rb2')
        )
    }, {
        'side': 'off',
        'role': 'wr1',
        'rating': calculate_off_wr_rating(
            get_role_history(season, week, team, 'wr1')
        )
    }, {
        'side': 'off',
        'role': 'wr2',
        'rating': calculate_off_wr_rating(
            get_role_history(season, week, team, 'wr2')
        )
    }, {
        'side': 'off',
        'role': 'wr3',
        'rating': calculate_off_wr_rating(
            get_role_history(season, week, team, 'wr3')
        )
    }])

    res['season'] = season
    res['week'] = week
    res['team'] = team

    print(res)

    add_rating_df(res)

    return res

if __name__ == "__main__":
    for index, row in get_all_games().sort_values(by=['season', 'week'], ascending=False).iterrows():
        print('processing > ', row['season'], row['week'], row['teamDisplay'])
        get_team_rating(row['season'], row['week'], row['teamDisplay'])

        if index % 100 == 0:
            save_rating_df()

    # rtn = get_defensive_stats(2024, 3, 'PHI')

    #season = get_players_df()
    #teams = season[
    #    (season['season'] == 2024) &
    #    (season['week'] == 3)
    #]['teamDisplay'].unique()

    #for team in teams: 
    #    get_def_rating(2024, 2, team)

    save_rating_df()