import os
import pathlib
import pandas as pd

from modeling.common import save_state
from modeling.games import raw_games, raw_players
from modeling.usage import player_usage_deltas
from modeling.rating import player_rating_deltas, calculate_off_rating
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
    results, ratings, usage = compare_teams(2024, 11, 'PHI', 'WSH')
    print('>>>> results\n', results)
    print('>>>> ratings\n', ratings)
    print('>>>> usage\n', usage)


def process_games():
    results = []
    week_stats = None

    for index, row in raw_games.get_frame().iterrows():
        try:
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
                )
                compare, ratings, stats = compare_teams(
                    row["season"],
                    row["week"] - 1,
                    row["homeTeamDisplay"],
                    row["awayTeamDisplay"],
                )

                raw_home = raw_players.access_week({
                    'season': row["season"], 
                    'week': row["week"], 
                    'team': row["homeTeamDisplay"]
                }).sum()

                raw_away =  raw_players.access_week({
                    'season': row["season"], 
                    'week': row["week"], 
                    'team': row["awayTeamDisplay"]
                }).sum()

                t = row.to_dict()
                home_rating = calculate_off_rating(raw_home, {'qb':1, 'rb':1, 'wr':1})
                away_rating = calculate_off_rating(raw_away, {'qb':1, 'rb':1, 'wr':1})
                t.update(
                    {
                        "grade": compare["grade"],
                        "expected": row["homeScore"] > row["awayScore"],
                        "playerRating": compare["playerRating"],
                        "teamRating": compare["teamRating"],
                        "statsRating": compare["statsRating"],
                        "homeRating": home_rating,
                        "awayRating": away_rating,
                        "gameRating": home_rating - away_rating
                    }
                )

                results.append(t)
        except:
            pass

    df = pd.DataFrame(results)

    df.to_parquet(run_parquet_path)


if __name__ == "__main__":
    # process_games()

    dump()

    save_state()