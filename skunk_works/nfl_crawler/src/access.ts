import * as fs from 'fs';
import * as path from 'path';

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const dataDir = path.join(__dirname, `../cache`);
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

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

export async function readPlayer(playerId: string): Promise<PlayerResponse> {
    const playersDir = `${dataDir}/players`;
    if (!fs.existsSync(playersDir)){
        fs.mkdirSync(playersDir);
    }

    const playerPath = `${playersDir}/${playerId}.json`;
    if (fs.existsSync(playerPath)){
        return JSON.parse(fs.readFileSync(playerPath).toString('utf-8'));
    } else {
        const response = await fetch(
            `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${playerId}`
        );

        const content: PlayerResponseRaw = await response.json();
        try {
            delete content.athlete.links;
            delete content.videos;
            delete content.playerSwitcher;
            delete content.quicklinks;
            delete content.links;
            delete content.ticketsInfo;
            delete content.standings;

            console.log(`writing: ${content.athlete.displayName}`);
            fs.writeFileSync(
                playerPath,
                JSON.stringify(content, null, 2),
                {encoding: 'utf-8'}
            );
        } catch(ex){
            console.log(playerId, Object.keys(content), content);
        }

        return content;
    }
}

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
    home,
    away
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

export async function readGame(gameId: string, weekDir?: string): Promise<GameResponse>{
    const gamePath = weekDir ? `${weekDir}/${gameId}.json` : null;

    if (gamePath && fs.existsSync(gamePath)){
        return JSON.parse(fs.readFileSync(gamePath).toString('utf-8'));
    } else {
        const response = await fetch(
            'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event='+gameId
        );

        const content: GameResponseRaw = await response.json();

        delete content.leaders;
        delete content.broadcasts;
        delete content.pickcenter;
        delete content.againstTheSpread;
        delete content.odds;
        delete content.news;
        delete content.article;
        delete content.videos;
        delete content.standings;

        if (gamePath){
            const teams = content.boxscore.teams;
            const gameName = `${teams[0].team.abbreviation} vs ${teams[1].team.abbreviation} via ${gameId}`;
            
            console.log('writing: ', gameName);
            fs.writeFileSync(
                gamePath,
                JSON.stringify(content, null, 2),
                {encoding: 'utf-8'}
            );
        }

        return content;
    }
}

export type WeeklyResponseItem = {
    $ref: string
};

export type WeeklyResponse = {
    count: number;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    items: WeeklyResponseItem[]
};

export async function readWeek(season: number, week: number, partOfSeason = 2){
    // https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2016/types/2/weeks/1/events
    // types: 1 => preseason, 2 => regular season, 3 => post season
    const response = await fetch(
        'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons'+
        `/${season}/types/${partOfSeason}/weeks/${week}/events`
    );
    const content: WeeklyResponse = await response.json();

    // TODO: take pagination into account
    
    const ids = content.items.map(item => {
        const regex = /events\/(.*)\?/g;
        return regex.exec(item.$ref)[1];
    });

    const gamesDir = `${dataDir}/games`;
    if (!fs.existsSync(gamesDir)){
        fs.mkdirSync(gamesDir);
    }

    const seasonDir = `${gamesDir}/${season}`;
    if (!fs.existsSync(seasonDir)){
        fs.mkdirSync(seasonDir);
    }

    const weekDir = `${seasonDir}/${week}`;
    if (!fs.existsSync(weekDir)){
        fs.mkdirSync(weekDir);
    }

    console.log('processing:', season, week);
    return Promise.all(ids.map(async (id) => readGame(id, weekDir)));
}

export async function readSeason(season: number, startWeek: number, stopWeek: number, partOfSeason = 2){
    let week = null;
    
    if (startWeek < stopWeek){
        week = startWeek;
    } else {
        week = stopWeek;
        stopWeek = startWeek;
    }

    for(let week = startWeek; week <= stopWeek; week++){
        await readWeek(season, week);
    }
}
