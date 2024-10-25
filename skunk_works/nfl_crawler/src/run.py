from modeling.games import raw_games, raw_players
from modeling.usage import player_usage_deltas
from modeling.rating import player_rating_deltas

print(raw_games.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))
print(raw_players.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))

print('off > \n', player_usage_deltas.access_week({'season': 2024, 'week': 4, 'team': 'PHI', 'side': 'off'}).reset_index())
print('def > \n', player_usage_deltas.access_week({'season': 2024, 'week': 4, 'team': 'PHI', 'side': 'def'}).reset_index())

print('off > \n', player_rating_deltas.access_week({'season': 2024, 'week': 4, 'team': 'PHI', 'side': 'off'}).reset_index())
print('def > \n', player_rating_deltas.access_week({'season': 2024, 'week': 4, 'team': 'PHI', 'side': 'def'}).reset_index())