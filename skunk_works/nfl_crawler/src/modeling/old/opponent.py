import pandas as pd

from .team import team_week

from .games import game_get_df
from .selector import TeamSelect
from .week import week_selector_decode


def opponent_history(selector: TeamSelect) -> pd.DataFrame:
    season_df = week_selector_decode(
        {"season": selector["season"], "week": selector["week"]}
    )

    return season_df[~(season_df["teamDisplay"] == selector["team"])]


def opponent_get(selector: TeamSelect) -> str | None:
    games_df = game_get_df()
    season_df = games_df[
        (games_df["season"] == selector["season"])
        & (games_df["week"] == selector["week"])
    ]
    team_df = season_df[
        (season_df["homeTeamDisplay"] == selector["team"])
        | (season_df["awayTeamDisplay"] == selector["team"])
    ]

    if len(team_df.index) == 0:
        return None
    else:
        team_df = team_df.iloc[0]

    return (
        team_df["homeTeamDisplay"]
        if team_df["awayTeamDisplay"] == selector["team"]
        else team_df["awayTeamDisplay"]
    )


def opponent_schedule(selector: TeamSelect):
    games_df = game_get_df()
    season_df = games_df[
        (games_df["season"] == selector["season"])
        & (games_df["week"] <= selector["week"])
    ]
    team_df = season_df[
        (season_df["homeTeamDisplay"] == selector["team"])
        | (season_df["awayTeamDisplay"] == selector["team"])
    ]

    def reduce_row(row):
        return {
            "season": row["season"],
            "week": row["week"],
            "opponent": row["homeTeamDisplay"]
            if row["homeTeamDisplay"] != selector["team"]
            else row["awayTeamDisplay"],
        }

    return list(team_df.apply(reduce_row, axis=1))


def opponent_schedule_history(selector: TeamSelect) -> pd.DataFrame:
    opponent_df = map(
        lambda game: team_week(
            {"season": game["season"], "week": game["week"], "team": game["opponent"]}
        ),
        opponent_schedule(selector),
    )

    return pd.concat(opponent_df)
