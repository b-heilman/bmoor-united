# Expected to be run from script directory
cd ../src

echo "---preparing data---"
echo 'creating parquet...'
python3 csv_to_parquet.py

echo "---generating graphs---"
echo "populating player data..."
npx ts-node hydrate_player_graph.ts
echo "populating game data..."
npx ts-node hydrate_game_graph.ts