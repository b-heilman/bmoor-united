import os
import pandas as pd
import pathlib

from .offense import (
    offense_role_compute,
    offense_selector_across,
    offense_selector_decode,
)

from .defense import (
    defense_role_compute,
    defense_selector_across,
    defense_selector_decode,
)

from .common import fields as stats_fields, roles as stats_roles

from .opponent import opponent_schedule

from .selector import TeamSelect, WeekSelect

base_dir = str(pathlib.Path(__file__).parent.resolve())

delta_offense_df = None
delta_offense_parquet_path = os.path.abspath(
    base_dir + "/../../cache/parquet/delta_offense.parquet"
)


# get_offense_df
def delta_offense_get_df() -> pd.DataFrame:
    global delta_offense_df

    if delta_offense_df is None:
        if os.path.exists(delta_offense_parquet_path):
            delta_offense_df = pd.read_parquet(delta_offense_parquet_path)
        else:
            delta_offense_df = pd.DataFrame()

    return delta_offense_df


# add_offense_df
def delta_offense_add_df(add_df):
    global delta_offense_df

    delta_offense_df = pd.concat([delta_offense_df, add_df])


# save_offense_df
def delta_offense_save_df():
    global delta_offense_df

    delta_offense_df.reset_index(inplace=True, drop=True)

    delta_offense_df.to_parquet(delta_offense_parquet_path)




delta_defense_df = None
delta_defense_parquet_path = os.path.abspath(
    base_dir + "/../../cache/parquet/delta_defense.parquet"
)


# get_offense_df
def delta_defense_get_df() -> pd.DataFrame:
    global delta_defense_df

    if delta_defense_df is None:
        if os.path.exists(delta_defense_parquet_path):
            delta_defense_df = pd.read_parquet(delta_defense_parquet_path)
        else:
            delta_defense_df = pd.DataFrame()

    return delta_defense_df


# add_offense_df
def delta_defense_add_df(add_df):
    global delta_defense_df

    delta_defense_df = pd.concat([delta_defense_df, add_df])


# save_offense_df
def delta_defense_save_df():
    global delta_defense_df

    delta_defense_df.reset_index(inplace=True, drop=True)

    delta_defense_df.to_parquet(delta_defense_parquet_path)



