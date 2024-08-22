export interface PlayerResponse {
    athlete?: {
        id: string,
        displayName: string,
        position: {
            abbreviation: string
        },
    },
};

export interface PlayerResponseRaw extends PlayerResponse {
    athlete?: {
        id: string,
        displayName: string,
        position: {
            abbreviation: string
        },
        links: string[],
    },
    videos: string[],
    playerSwitcher: string[],
    quicklinks: string[],
    links: string[],
    ticketsInfo: string[],
    standings: string[]
};

export type TeamInfo = {
    id: string,
    abbreviation: string,
}

export type BoxscoreTeamInfo = {
    team: TeamInfo,
    statistics: {}
}

export type BoxscorePlayerStatistics = {
    athlete: {
        id: string,
        displayName: string
    },
    stats: string[]
}

/*
"name": "passing",
            "keys": [
              "completions/passingAttempts",
              "passingYards",
              "yardsPerPassAttempt",
              "passingTouchdowns",
              "interceptions",
              "sacks-sackYardsLost",
              "adjQBR",
              "QBRating"
            ],
"name": "rushing",
            "keys": [
              "rushingAttempts",
              "rushingYards",
              "yardsPerRushAttempt",
              "rushingTouchdowns",
              "longRushing"
            ],
"name": "receiving",
            "keys": [
              "receptions",
              "receivingYards",
              "yardsPerReception",
              "receivingTouchdowns",
              "longReception",
              "receivingTargets"
            ],
"name": "fumbles",
            "keys": [
              "fumbles",
              "fumblesLost",
              "fumblesRecovered"
            ],
"name": "defensive",
            "keys": [
              "totalTackles",
              "soloTackles",
              "sacks",
              "tacklesForLoss",
              "passesDefended",
              "QBHits",
              "defensiveTouchdowns"
            ],
*/
export type BoxscorePlayerStatisticsGroup = {
    name: string,
    keys: string[],
    athletes: BoxscorePlayerStatistics[]
}

export type BoxscorePlayersInfo = {
    team: TeamInfo,
    statistics: BoxscorePlayerStatisticsGroup[]
}

export type BoxscoreInfo = {
    teams: BoxscoreTeamInfo[]
    players: BoxscorePlayersInfo[]
}

export enum HomeAway {
    home = 'home',
    away = 'away'
}

export type HeaderCompetitor = {
    homeAway: HomeAway,
    winner: boolean,
    team: TeamInfo,
    score: string
};

export type HeaderCompetion = {
    neutralSite: boolean,
    date: string,
    competitors: HeaderCompetitor[]
};

export type HeaderInfo = {
    id: string,
    competitions: HeaderCompetion[],
    season: {
        year: number
    },
    week: number
};

export interface GameResponse {
    header: HeaderInfo
    boxscore: BoxscoreInfo
};

export interface GameResponseRaw extends GameResponse {
    leaders: string,
    broadcasts: string,
    pickcenter: string,
    againstTheSpread: string,
    odds: string,
    news: string,
    article: string,
    videos: string,
    standings: string
};