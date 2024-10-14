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

from modeling.compare import compare_teams

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

    print('=====')
    print(rating_compute(games_all().iloc[0]))
    #for index, row in games_all().iterrows():
    #    print('rating processing > ', row['season'], row['week'], row['team'])
    #    rating_compute(row)

    #    if index % 100 == 0:
    #        rating_save_df()

    rating_save_df()

def process_games():
    results = {
        't': 0,
        'f': 0,
    }

    for index, row in games_matchups().iterrows():
        if row['week'] > 2 and row['week'] < 16:
            print('analyzing > ', row['season'], row['week'], row['homeTeamDisplay'], row['awayTeamDisplay'])
            compare = compare_teams(row['season'], row['week'], row['homeTeamDisplay'], row['awayTeamDisplay'])
            home_stats = compare.iloc[0]
            away_stats = compare.iloc[1]

            home_expected = home_stats['rating'] > away_stats['rating']
            home_won = row['homeScore'] > row['awayScore']
            diff = abs(home_stats['rating'] - away_stats['rating'])

            if diff < 150:
                continue

            print(f"results >> {home_stats['rating']} > {away_stats['rating']} >> {row['homeScore']} > {row['awayScore']}")
            if home_won:
                if home_expected:
                    results['t'] += 1
                else:
                    results['f'] += 1
            else:
                if home_expected:
                    results['f'] += 1
                else:
                    results['t'] += 1
                    
    acc = results['t'] / (results['t'] + results['f'])
    print('results: ', results, acc)

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
    print('>>>> qb >', rating_calculate_off(qb, qb=1, wr=0, rb=0))

    rb = {'rushAtt': 16, 'rushYds': 60, 'rushTd': 1, 'fumblesLost': 0.5}
    print('>>>> rb >', rating_calculate_off(rb, qb=0, wr=0, rb=1))

    wr = {'recAtt': 9, 'recCmp': 6, 'recYds': 100, 'recTd': 1, 'fumblesLost': 0.5}
    print('>>>> wr >', rating_calculate_off(wr, qb=0, wr=1, rb=0))

if __name__ == "__main__":
    # build_stats()

    # build_rating()

    # process_games()

    delta_rating()

    # calc_baseline()