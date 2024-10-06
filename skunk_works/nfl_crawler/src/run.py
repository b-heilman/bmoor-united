from modeling.games import (
    games_all,
    games_matchups
)

from modeling.rating import (
    rating_get_df,
    rating_save_df,
    rating_compute
)

from modeling.offense import (
    offense_role_get_df,
    offense_role_save_df,
    offense_role_compute
)

from modeling.defense import (
    defense_role_get_df,
    defense_role_compute,
    defense_role_save_df
)

from modeling.compare import compare_teams

def build_stats():
    offense_role_get_df()
    defense_role_get_df()

    for index, row in games_all().iterrows():
        print('defense processing > ', row['season'], row['week'], row['team'])
        defense_role_compute(row)

        if index % 100 == 0:
            offense_role_save_df()
            defense_role_save_df()

    offense_role_save_df()
    defense_role_save_df()

def build_rating():
    rating_get_df()

    for index, row in games_all().iterrows():
        print('rating processing > ', row['season'], row['week'], row['team'])
        rating_compute(row)

        if index % 100 == 0:
            rating_save_df()

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

def run_specific():
    print(
        defense_role_compute({
            'season': 2017,
            'week': 7,
            'team': 'CAR'
        })
    )

if __name__ == "__main__":
    build_stats()

    # build_rating()

    # process_games()

    # run_specific()