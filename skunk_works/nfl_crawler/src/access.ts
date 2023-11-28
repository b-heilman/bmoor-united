import * as fs from 'fs';
import * as path from 'path';

import { PlayerResponseRaw, GameResponseRaw, PlayerResponse, GameResponse } from './access.interface';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export const cacheDir = path.join(__dirname, `../cache`);
if (!fs.existsSync(cacheDir)){
    fs.mkdirSync(cacheDir);
}

export async function readPlayer(playerId: string): Promise<PlayerResponse> {
    const playersDir = `${cacheDir}/players`;
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
            delete content.videos;
            delete content.playerSwitcher;
            delete content.quicklinks;
            delete content.links;
            delete content.ticketsInfo;
            delete content.standings;
            delete content.athlete.links;

            console.log(`writing: ${content.athlete.displayName}`);  
        } catch(ex){
            console.log(playerId, Object.keys(content), content);
        }
        // even save the bad cache
        fs.writeFileSync(
            playerPath,
            JSON.stringify(content, null, 2),
            {encoding: 'utf-8'}
        );

        return content;
    }
}

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

    const gamesDir = `${cacheDir}/games`;
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
