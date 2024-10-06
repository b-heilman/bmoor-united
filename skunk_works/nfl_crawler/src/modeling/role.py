import os
import pandas as pd
import pathlib

from .stats import common_fields

from .offense import offense_role_compute

from .team import team_selector_decode

from .selector import TeamSelector


def role_week(selector: TeamSelector, role):
    adv = offense_role_compute(selector)

    roles = adv.set_index("role")
    player = roles.loc[role]

    player_df = team_selector_decode(selector)

    return player_df[
        (player_df["week"] == selector["week"])
        & (player_df["playerDisplay"] == player["playerDisplay"])
    ].iloc[0]


def role_history(selector: TeamSelector, role):
    adv = offense_role_compute(selector)

    roles = adv.set_index("role")
    player = roles.loc[role]

    player_df = team_selector_decode(selector)

    return player_df[(player_df["playerDisplay"] == player["playerDisplay"])][
        common_fields
    ].mean()
