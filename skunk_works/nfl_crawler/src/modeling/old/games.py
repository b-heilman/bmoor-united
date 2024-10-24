


def games_all() -> pd.DataFrame:
    base = game_get_df()

    home_df = base[["season", "week", "homeTeamDisplay"]].rename(
        columns={"homeTeamDisplay": "team"}
    )
    away_df = base[["season", "week", "awayTeamDisplay"]].rename(
        columns={"awayTeamDisplay": "team"}
    )

    return pd.concat([home_df, away_df]).sort_values(
        by=["season", "week", "team"], ascending=False
    )


def games_matchups() -> pd.DataFrame:
    return game_get_df().sort_values(
        by=["season", "week", "homeTeamDisplay"], ascending=False
    )
