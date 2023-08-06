import os
import sys
import json
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

with open(os.path.join(sys.path[0], '../data/nfl_offense.csv'), "r") as f:
    df = pd.read_csv(f)

"""
  -------- unwanted
  "Total_DKP",
  "Off_DKP",
  "Total_FDP",
  "Off_FDP",
  "Total_SDP",
  "Off_SDP",
  "designed_rush_att",
  "comb_pass_rush_play",
  "comb_pass_play",
  "comb_rush_play",
  "Team_abbrev",
  "Opponent_abbrev",
  "two_point_conv",
  "total_ret_td",
  "offensive_fumble_recovery_td",
  "pass_yds_bonus",
  "rush_yds_bonus",
  "rec_yds_bonus",
  "pass_sacked_yds",
  "offense",
  "off_pct",
  -------- future game stats
  "OT",
  "Roof",
  "Surface",
  "Temperature",
  "Humidity",
  "Wind_Speed"
"""

with open('../data/weeks.json', 'r') as file:
  week_data = json.load(file)
  # need to flip this to make dataframe
  df_source = []

  for week in week_data:
    for date in week['dates']:
      df_source.append({
        "game_date": date,
        "season": week["season"],
        "week": week["week"]
      })

  join = pd.DataFrame(df_source)

# step 1, standardize the fields to what I expect
players = df[[
  "game_id",
  "game_date",
  "player_id",
  "pos",
  "player",
  "team",
  "pass_cmp",
  "pass_att",
  "pass_yds",
  "pass_td",
  "pass_int",
  "pass_sacked",
  "pass_long",
  "pass_rating",
  "pass_target_yds",
  "pass_poor_throws",
  "pass_blitzed",
  "pass_hurried",
  "rush_scrambles",
  "rush_att",
  "rush_yds",
  "rush_td",
  "rush_long",
  "rush_yds_before_contact",
  "rush_yac",
  "rush_broken_tackles",
  "targets",
  "rec", 
  "rec_yds",
  "rec_td",
  "rec_drops",
  "rec_long",
  "rec_air_yds",
  "rec_yac",
  "fumbles_lost"
]].rename(
  columns={
    "rush_scrambles":"pass_scrambles",
    "targets":"rec_att",
    "rec":"rec_cmp"
  }
)

players['game_ref'] = players['game_id']

games = df[[
  "game_id",
  "game_date",
  "Vegas_Line",
  "Vegas_Favorite",
  "Over_Under",
  'home_team',
  'home_score',
  'vis_team',
  'vis_score'
]].groupby(
  by='game_id'
).max().reset_index(
  inplace=False
)

if not os.path.exists('../data/parquet'):
  os.mkdir('../data/parquet')

games = join.merge(games, on="game_date", how="left")
players = join.merge(players, on="game_date", how="left")

def write_file(df, path):
  table = pa.Table.from_pandas(df)

  pq.write_table(table, path, version='1.0', use_dictionary=False)

write_file(games, '../data/parquet/games.parquet')
print('--games--\n', games.head(5))

write_file(players, '../data/parquet/players.parquet')
print('--players--\n', players.head(5))

