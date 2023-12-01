# Expected to be run from script directory
cd ../src

echo "---generating graphs---"
echo "populating player data..."
npx ts-node hydrate_player_graph.ts
echo "populating game data..."
npx ts-node hydrate_game_graph.ts