import os
import pathlib
import pandas as pd

from modeling.common import (
    fields as stats_fields
)

from modeling.games import (
    games_all,
    games_matchups
)

from modeling.rating import (
    rating_get_df,
    rating_save_df,
    rating_compute,
    rating_calculate_off,
    rating_calculate_def,
    rating_compute_diff
)

from modeling.offense import (
    offense_role_get_df,
    offense_role_save_df,
)

from modeling.defense import (
    defense_role_get_df,
    defense_role_save_df,
)

from modeling.delta import (
    delta_defense_compute,
    delta_offense_compute,
    delta_defense_save_df,
    delta_offense_save_df
)

from modeling.compare import (
    compare_teams,
    compare_teams_rating, 
    compare_teams_stats
)

base_dir = str(pathlib.Path(__file__).parent.resolve())
run_parquet_path = os.path.abspath(
    base_dir + "/../cache/parquet/run_results.parquet"
)

def build_stats():
    offense_role_get_df()
    defense_role_get_df()

    for index, row in games_all().iterrows():
        print('defense processing > ', row['season'], row['week'], row['team'])
        delta_defense_compute(row)
        delta_offense_compute(row)

        if index % 100 == 0:
            offense_role_save_df()
            defense_role_save_df()
            delta_offense_save_df()
            delta_defense_save_df()

    offense_role_save_df()
    defense_role_save_df()
    delta_offense_save_df()
    delta_defense_save_df()

def build_rating():
    rating_get_df()

    for index, row in games_all().iterrows():
        print('rating processing > ', row['season'], row['week'], row['team'])
        rating_compute(row)

        if index % 100 == 0:
            rating_save_df()

    rating_save_df()



def process_games():
    results = []

    for index, row in games_matchups().iterrows():
        if row['week'] > 2 and row['week'] < 16:
            print('analyzing > ', row['season'], row['week'], row['homeTeamDisplay'], row['awayTeamDisplay'])
            compare, ratings, stats = compare_teams(row['season'], row['week']-1, row['homeTeamDisplay'], row['awayTeamDisplay'])

            t = row.to_dict()
            t.update({
                'grade': compare['grade'],
                'expected': row['homeScore'] > row['awayScore'],
                'rating': compare['rating'],
                'stats': compare['stats']
            })

            results.append(t)
                    
    df = pd.DataFrame(results)

    df.to_parquet(run_parquet_path)

def delta_defense():
    roles1 = delta_defense_compute({
        'season': 2024,
        'week': 1,
        'team': 'PHI'
    }).set_index('role')

    roles2 = delta_defense_compute({
        'season': 2024,
        'week': 2,
        'team': 'PHI'
    }).set_index('role')

    roles3 = delta_defense_compute({
        'season': 2024,
        'week': 3,
        'team': 'PHI'
    }).set_index('role')

    roles4 = delta_defense_compute({
        'season': 2024,
        'week': 4,
        'team': 'PHI'
    }).set_index('role')

    pos = 'wr1'

    r1 = roles1.loc[pos]
    print('>>>> rating 1 >', rating_calculate_off(r1, qb=0.0, wr=1.0, rb=2.0))
    print(r1)

    r2 = roles2.loc[pos]
    print('>>>> rating 2 >', rating_calculate_off(r2, qb=0.0, wr=1.0, rb=2.0))
    print(r2)

    r3 = roles3.loc[pos]
    print('>>>> rating 3 >', rating_calculate_off(r3, qb=0.0, wr=1.0, rb=2.0))
    print(r3)

    r4 = roles4.loc[pos]
    print('>>>> rating 4 >', rating_calculate_off(r4, qb=0.0, wr=1.0, rb=2.0))
    print(r4)

def delta_rating():
    diff1 = rating_compute_diff({
        'season': 2024,
        'week': 1,
        'team': 'PHI'
    })
    print('--diff1--')
    print(diff1)

    diff2 = rating_compute_diff({
        'season': 2024,
        'week': 2,
        'team': 'PHI'
    })
    print('--diff2--')
    print(diff2)

    diff3 = rating_compute_diff({
        'season': 2024,
        'week': 3,
        'team': 'PHI'
    })
    print('--diff3--')
    print(diff3)

    diff4 = rating_compute_diff({
        'season': 2024,
        'week': 4,
        'team': 'PHI'
    })
    print('--diff4--')
    print(diff4)

    diff5 = rating_compute_diff({
        'season': 2024,
        'week': 5,
        'team': 'PHI'
    })
    print('--diff5--')
    print(diff5)

def calc_baseline():
    df = offense_role_get_df()
    print(df)
    mean = df[(df['season'] == 2023)]\
        .groupby("role").agg({stat: "mean" for stat in stats_fields})
    
    print(mean)

    qb = {'passAtt': 30, 'passCmp': 20, 'passYds': 220, 'passTd': 2, 'passInt': 0.5}
    print('>>>> qb > off', rating_calculate_off(qb, qb=1, wr=0, rb=0))
    print('>>>> qb > def', rating_calculate_def(qb, qb=1, wr=0, rb=0))

    rb = {'rushAtt': 16, 'rushYds': 80, 'rushTd': 1, 'fumblesLost': 0.5}
    print('>>>> rb > off', rating_calculate_off(rb, qb=0, wr=0, rb=1))
    print('>>>> rb > def', rating_calculate_def(rb, qb=0, wr=0, rb=1))

    wr = {'recAtt': 9, 'recCmp': 6, 'recYds': 100, 'recTd': 1, 'fumblesLost': 0.5}
    print('>>>> wr > off', rating_calculate_off(wr, qb=0, wr=1, rb=0))
    print('>>>> wr > def', rating_calculate_def(wr, qb=0, wr=1, rb=0))

if __name__ == "__main__":
    # build_stats()

    # build_rating()

    # delta_rating()

    # calc_baseline()

    # print(compare_teams(2024, 3, 'BAL', 'BUF'))

    process_games()