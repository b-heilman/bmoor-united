import os
import pathlib
import pandas as pd

from modeling.common import save_state
from modeling.games import raw_games, raw_players
from modeling.usage import player_usage_deltas
from modeling.rating import player_rating_deltas
from modeling.compare import compare_teams

base_dir = str(pathlib.Path(__file__).parent.resolve())
run_parquet_path = os.path.abspath(base_dir + "/../cache/parquet/analysis.parquet")

def dump():
    print(raw_games.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))
    print(raw_players.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))

    print('off > \n', player_usage_deltas.access_week({'season': 2024, 'week': 2, 'team': 'PHI', 'side': 'off'}).reset_index())
    print('def > \n', player_usage_deltas.access_week({'season': 2024, 'week': 2, 'team': 'PHI', 'side': 'def'}).reset_index())

    print('off > \n', player_rating_deltas.access_week({'season': 2024, 'week': 2, 'team': 'PHI', 'side': 'off'}).reset_index())
    print('def > \n', player_rating_deltas.access_week({'season': 2024, 'week': 2, 'team': 'PHI', 'side': 'def'}).reset_index())

    # print('>>>>\n', compare_teams(2024, 5, 'PHI', 'WSH'))
    results, ratings, usage = compare_teams(2024, 2, 'PHI', 'WSH')
    print('>>>> results\n', results)
    print('>>>> ratings\n', ratings)
    print('>>>> usage\n', usage)


def process_games():
    results = []

    for index, row in raw_games.get_frame().iterrows():
        if row["week"] > 2 and row["week"] < 16:
            print(
                "analyzing > ",
                row["season"],
                row["week"],
                row["homeTeamDisplay"],
                row["awayTeamDisplay"],
            )
            compare, ratings, stats = compare_teams(
                row["season"],
                row["week"] - 1,
                row["homeTeamDisplay"],
                row["awayTeamDisplay"],
            )

            t = row.to_dict()
            t.update(
                {
                    "grade": compare["grade"],
                    "expected": row["homeScore"] > row["awayScore"],
                    "rating": compare["rating"],
                    "stats": compare["stats"],
                }
            )

            results.append(t)

    df = pd.DataFrame(results)

    df.to_parquet(run_parquet_path)


if __name__ == "__main__":
    process_games()

    # dump()

    save_state()