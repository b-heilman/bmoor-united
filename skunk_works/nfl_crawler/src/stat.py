import os
import json
import pathlib
import pandas as pd

from stats.common import save_state
from stats.games import raw_games, raw_players
from stats.usage import player_usage_deltas
from stats.rating import player_rating_deltas, calculate_off_rating
from stats.compare import compare_teams, build_training

base_dir = str(pathlib.Path(__file__).parent.resolve())
training_parquet_path = os.path.abspath(base_dir + "/../cache/parquet/training.parquet")
training_info_path = os.path.abspath(base_dir + "/../cache/parquet/training.json")

def dump():
    print(raw_games.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))
    print(raw_players.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))

    print('off > \n', player_usage_deltas.access_week({'season': 2024, 'week': 2, 'team': 'PHI', 'side': 'off'}).reset_index())
    print('def > \n', player_usage_deltas.access_week({'season': 2024, 'week': 2, 'team': 'PHI', 'side': 'def'}).reset_index())

    print('off > \n', player_rating_deltas.access_week({'season': 2024, 'week': 2, 'team': 'PHI', 'side': 'off'}).reset_index())
    print('def > \n', player_rating_deltas.access_week({'season': 2024, 'week': 2, 'team': 'PHI', 'side': 'def'}).reset_index())

    # print('>>>>\n', compare_teams(2024, 5, 'PHI', 'WSH'))
    results = compare_teams(2024, 11, 'PHI', 'WSH')
    print('>>>> results\n', results)


def process_games():
    history_range = 7
    analysis_parquet_path = os.path.abspath(base_dir + f"/../cache/parquet/analysis_{history_range}.parquet")

    results = []
    week_stats = None

    for index, row in raw_games.get_frame().iterrows():
        # try:
            if week_stats is None or row['week'] != week_stats['week']:
                if week_stats is not None and week_stats['count'] != 0:
                    print(week_stats, week_stats['correct'] / week_stats['count'])

                week_stats = {
                    'season': row["season"],
                    'week': row["week"],
                    'correct': 0,
                    'count': 0
                }

            if row["week"] > 2 and row["week"] < 16:
                print(
                    "analyzing > ",
                    row["season"],
                    row["week"],
                    row["homeTeamDisplay"],
                    row["awayTeamDisplay"],
                    history_range
                )
                compare = compare_teams(
                    row["season"],
                    row["week"] - 1,
                    row["homeTeamDisplay"],
                    row["awayTeamDisplay"],
                    history_range
                )

                compare['expected'] = row["homeScore"] > row["awayScore"]
                compare['diff'] = row["homeScore"] - row["awayScore"]

                results.append(compare)
        #except:
        #    pass

    df = pd.DataFrame(results)
    df.to_parquet(analysis_parquet_path)

def process_training():
    training = build_training()
    training['df'].to_parquet(training_parquet_path)

    with open(training_info_path, 'w', encoding='utf-8') as f:
        json.dump(training['info'], f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    # dump()

    process_games()

    # process_training()

    save_state()