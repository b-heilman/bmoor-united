from modeling.games import raw_games, raw_players

print(raw_games.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))

print(raw_players.access_week({'season': 2024, 'week': 4, 'team': 'PHI'}))