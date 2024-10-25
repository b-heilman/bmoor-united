from modeling.games import raw_games, raw_players
from modeling.roles import player_deltas
print(raw_games.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))

print(raw_players.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))

print('off > \n', player_deltas.access_week({'season': 2024, 'week': 4, 'team': 'PHI', 'side': 'off'}).reset_index())
print('def > \n', player_deltas.access_week({'season': 2024, 'week': 4, 'team': 'PHI', 'side': 'def'}).reset_index())