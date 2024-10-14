import pytest
import pandas as pd

from . import rating as sut


def test_rating_calculate_off_qb():
    qb1 = pd.Series(
        {
            "passCmp": 17.0,
            "passAtt": 34.0,
            "passYds": 260.0,
            "passTd": 2.0,
            "passInt": 1.0,
            "rushAtt": 0.0,
            "rushYds": 0.0,
            "rushTd": 0.0,
            "recAtt": 0.0,
            "recCmp": 0.0,
            "recYds": 0.0,
            "recTd": 0.0,
            "sacked": 1.0,
            "fumbles": 0.0,
            "fumblesLost": 0.0,
            "playerPosition": "qb",
            "season": 2024,
        }
    )
    off_rating = sut.rating_calculate_off_qb(qb1)
    def_rating = sut.rating_calculate_def_qb(qb1)

    assert off_rating == pytest.approx(82.96, 0.02)
    assert def_rating == pytest.approx(-20.50, 0.02)

    qb2 = pd.Series(
        {
            "passCmp": 20.0,
            "passAtt": 34.0,
            "passYds": 278.0,
            "passTd": 2.0,
            "passInt": 2.0,
            "rushAtt": 13.0,
            "rushYds": 33.0,
            "rushTd": 0.0,
            "recAtt": 0.0,
            "recCmp": 0.0,
            "recYds": 0.0,
            "recTd": 0.0,
            "sacked": 2.0,
            "fumbles": 2.0,
            "fumblesLost": 1.0,
            "playerPosition": "qb",
            "season": 2024,
        }
    )
    off_rating = sut.rating_calculate_off_qb(qb2)
    def_rating = sut.rating_calculate_def_qb(qb2)

    assert off_rating == pytest.approx(87.498, 0.02)
    assert def_rating == pytest.approx(-42.29, 0.02)

    qb3 = pd.Series(
        {
            "passCmp": 18.0,
            "passAtt": 23.0,
            "passYds": 232.0,
            "passTd": 2.0,
            "passInt": 0.0,
            "rushAtt": 9.0,
            "rushYds": 39.0,
            "rushTd": 2.0,
            "recAtt": 0.0,
            "recCmp": 0.0,
            "recYds": 0.0,
            "recTd": 0.0,
            "sacked": 2.0,
            "fumbles": 1.0,
            "fumblesLost": 1.0,
            "playerPosition": "qb",
            "season": 2024,
        }
    )
    off_rating = sut.rating_calculate_off_qb(qb3)
    def_rating = sut.rating_calculate_def_qb(qb3)

    assert off_rating == pytest.approx(150.54, 0.02)
    assert def_rating == pytest.approx(20.74, 0.02)

    qb4 = pd.Series(
        {
            "passCmp": 17.0,
            "passAtt": 24.0,
            "passYds": 184.0,
            "passTd": 0.0,
            "passInt": 0.0,
            "rushAtt": 16.0,
            "rushYds": 88.0,
            "rushTd": 2.0,
            "recAtt": 0.0,
            "recCmp": 0.0,
            "recYds": 0.0,
            "recTd": 0.0,
            "sacked": 2.0,
            "fumbles": 3.0,
            "fumblesLost": 0.0,
            "playerPosition": "qb",
            "season": 2024,
        }
    )
    off_rating = sut.rating_calculate_off_qb(qb4)
    def_rating = sut.rating_calculate_def_qb(qb4)

    assert off_rating == pytest.approx(122.66, 0.02)
    assert def_rating == pytest.approx(-7.1, 0.02)


def test_rating_calculate_off_rb():
    rb1 = {
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 16.0,
        "rushYds": 84.0,
        "rushTd": 0.0,
        "recAtt": 3.0,
        "recCmp": 2.0,
        "recYds": 20.0,
        "recTd": 0.0,
        "sacked": 0.0,
        "fumbles": 1.0,
        "fumblesLost": 0.0,
        "playerPosition": "rb",
        "season": 2024,
        "week": 1,
        "team": "PHI",
    }
    off_rating = sut.rating_calculate_off_rb(rb1)
    def_rating = sut.rating_calculate_def_rb(rb1)

    assert off_rating == pytest.approx(122.66, 0.02)
    assert def_rating == pytest.approx(-2.42, 0.02)

    rb2 = {
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 4.0,
        "rushYds": 46.0,
        "rushTd": 0.0,
        "recAtt": 3.0,
        "recCmp": 2.0,
        "recYds": 2.0,
        "recTd": 0.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
        "playerPosition": "rb",
        "season": 2024,
        "week": 1,
        "team": "PHI",
    }
    off_rating = sut.rating_calculate_off_rb(rb2)
    def_rating = sut.rating_calculate_def_rb(rb2)

    assert off_rating == pytest.approx(83.56, 0.02)
    assert def_rating == pytest.approx(-38.73, 0.02)

    rb3 = {
        "playerDisplay": "Saquon Barkley",
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 24.0,
        "rushYds": 109.0,
        "rushTd": 2.0,
        "recAtt": 2.0,
        "recCmp": 2.0,
        "recYds": 23.0,
        "recTd": 1.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
        "playerPosition": "rb",
        "season": 2024,
        "week": 1,
        "team": "PHI",
    }
    off_rating = sut.rating_calculate_off_rb(rb3)
    def_rating = sut.rating_calculate_def_rb(rb3)

    assert off_rating == pytest.approx(137.48, 0.02)
    assert def_rating == pytest.approx(4.89, 0.02)

    rb4 = {
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 0.0,
        "rushYds": 0.0,
        "rushTd": 0.0,
        "recAtt": 0.0,
        "recCmp": 0.0,
        "recYds": 0.0,
        "recTd": 0.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
        "playerPosition": "rb",
    }
    off_rating = sut.rating_calculate_off_rb(rb4)
    def_rating = sut.rating_calculate_def_rb(rb4)

    assert off_rating == pytest.approx(0, 0.02)
    assert def_rating == pytest.approx(0, 0.02)

    rb5 = {
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 28.0,
        "rushYds": 147.0,
        "rushTd": 1.0,
        "recAtt": 1.0,
        "recCmp": 1.0,
        "recYds": 5.0,
        "recTd": 0.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
        "playerPosition": "rb",
    }
    off_rating = sut.rating_calculate_off_rb(rb5)
    def_rating = sut.rating_calculate_def_rb(rb5)

    assert off_rating == pytest.approx(148.02, 0.02)
    assert def_rating == pytest.approx(26.68, 0.02)


def test_rating_calculate_off_wr():
    wr1 = {
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 0.0,
        "rushYds": 0.0,
        "rushTd": 0.0,
        "recAtt": 7.0,
        "recCmp": 4.0,
        "recYds": 50.0,
        "recTd": 0.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_wr(wr1)
    def_rating = sut.rating_calculate_def_wr(wr1)

    assert off_rating == pytest.approx(65.2, 0.02)
    assert def_rating == pytest.approx(-42.84, 0.02)

    wr2 = {
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 1.0,
        "rushYds": 33.0,
        "rushTd": 1.0,
        "recAtt": 6.0,
        "recCmp": 4.0,
        "recYds": 138.0,
        "recTd": 1.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_wr(wr2)
    def_rating = sut.rating_calculate_def_wr(wr2)

    assert off_rating == pytest.approx(159.77, 0.02)
    assert def_rating == pytest.approx(38.91, 0.02)

    wr3 = {
        "playerDisplay": "Christian Watson",
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 0.0,
        "rushYds": 0.0,
        "rushTd": 0.0,
        "recAtt": 5.0,
        "recCmp": 3.0,
        "recYds": 13.0,
        "recTd": 1.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_wr(wr3)
    def_rating = sut.rating_calculate_def_wr(wr3)

    assert off_rating == pytest.approx(64.23, 0.02)
    assert def_rating == pytest.approx(-43.85, 0.02)

    wr4 = {
        "playerDisplay": "A.J. Brown",
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 0.0,
        "rushYds": 0.0,
        "rushTd": 0.0,
        "recAtt": 10.0,
        "recCmp": 5.0,
        "recYds": 119.0,
        "recTd": 1.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_wr(wr4)
    def_rating = sut.rating_calculate_def_wr(wr4)

    assert off_rating == pytest.approx(111.4, 0.02)
    assert def_rating == pytest.approx(3.33, 0.02)

    wr5 = {
        "playerDisplay": "DeVonta Smith",
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 0.0,
        "rushYds": 0.0,
        "rushTd": 0.0,
        "recAtt": 8.0,
        "recCmp": 7.0,
        "recYds": 84.0,
        "recTd": 0.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_wr(wr5)
    def_rating = sut.rating_calculate_def_wr(wr5)

    assert off_rating == pytest.approx(117.25, 0.02)
    assert def_rating == pytest.approx(9.16, 0.02)

    wr6 = {
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 0.0,
        "rushYds": 0.0,
        "rushTd": 0.0,
        "recAtt": 5.0,
        "recCmp": 4.0,
        "recYds": 31.0,
        "recTd": 0.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_wr(wr6)
    def_rating = sut.rating_calculate_def_wr(wr6)

    assert off_rating == pytest.approx(70.73, 0.02)
    assert def_rating == pytest.approx(-37.35, 0.02)

    wr7 = {
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 1.0,
        "rushYds": 13.0,
        "rushTd": 0.0,
        "recAtt": 9.0,
        "recCmp": 5.0,
        "recYds": 121.0,
        "recTd": 1.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_wr(wr7)
    def_rating = sut.rating_calculate_def_wr(wr7)

    assert off_rating == pytest.approx(120.38, 0.02)
    assert def_rating == pytest.approx(11.19, 0.02)


def test_rating_calculate_off_rest():
    rest1 = {
        "passCmp": 0.0,
        "passAtt": 1.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 0.0,
        "rushYds": 0.0,
        "rushTd": 0.0,
        "recAtt": 8.0,
        "recCmp": 2.0,
        "recYds": 37.0,
        "recTd": 0.0,
        "sacked": 1.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_rest(rest1)
    def_rating = sut.rating_calculate_def_rest(rest1)

    assert off_rating == pytest.approx(18.33, 0.02)
    assert def_rating == pytest.approx(-34.2, 0.02)

    rest2 = {
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 1.0,
        "rushYds": 2.0,
        "rushTd": 0.0,
        "recAtt": 4.0,
        "recCmp": 2.0,
        "recYds": 21.0,
        "recTd": 0.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_rest(rest2)
    def_rating = sut.rating_calculate_def_rest(rest2)

    assert off_rating == pytest.approx(19.35, 0.02)
    assert def_rating == pytest.approx(-29.62, 0.02)

    rest3 = {
        "playerDisplay": "aggregate",
        "passCmp": 0.0,
        "passAtt": 0.0,
        "passYds": 0.0,
        "passTd": 0.0,
        "passInt": 0.0,
        "rushAtt": 2.0,
        "rushYds": 2.0,
        "rushTd": 0.0,
        "recAtt": 9.0,
        "recCmp": 3.0,
        "recYds": 26.0,
        "recTd": 0.0,
        "sacked": 0.0,
        "fumbles": 0.0,
        "fumblesLost": 0.0,
    }
    off_rating = sut.rating_calculate_off_rest(rest3)
    def_rating = sut.rating_calculate_def_rest(rest3)

    assert off_rating == pytest.approx(15.24, 0.02)
    assert def_rating == pytest.approx(-33.78, 0.02)
