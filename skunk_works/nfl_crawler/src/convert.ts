import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import {default as parquet} from 'parquetjs-lite';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {resolve} from 'path';

import { readPlayer, cacheDir } from './access';
import { GameResponse, BoxscorePlayersInfo } from './access.interface';
import { 
    PlayerData, 
    playerSchema, 
    gameSchema, 
    TeamPlayersData,
    InteralPlayersData,
    StoredPlayerData,
    StoredGameData
} from './convert.interface';

export const parquetDir = `${cacheDir}/parquet`;
if (!fsSync.existsSync(parquetDir)){
    fsSync.mkdirSync(parquetDir);
}

function formatSeason(season: string|number): string {
    return String(season);
}

function formatWeek(week: string|number): string {
    if (typeof(week) === 'string'){
        if (week.length > 1){
            return week;
        } else {
            return '0'+week;
        }
    } else {
        if (week > 9){
            return String(week);
        } else {
            return '0'+week;
        }
    }
}


async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function recursiveFileStat(path: string | string[] ): Promise<string[]>{
    if (typeof(path) === 'string'){
        path = [path]
    }

    return (await Promise.all(path.map(async(p) => {
        const stats = await fs.stat(p);

        if (stats.isDirectory()){
            const children = await fs.readdir(p);

            return (await Promise.all(children.map(child => recursiveFileStat(p+'/'+child)))).flat();
        } else {
            return [p];
        }
    }))).flat();
    
}

const playerMap = new Map<string, string>();
function playerLookup(id, display){
    if (playerMap.has(id)){
        return playerMap.get(id);
    } else {
        playerMap.set(id, display);
        return display;
    }
}

const positionNormalization = {
    'qb': 'qb',
    'rb': 'rb',
    'rb/w': 'rb',
    'hb': 'rb',
    'fb': 'rb',
    'fb/d': 'rb',
    'fb/r': 'rb',
    'wr': 'wr',
    'wr/r': 'wr',
    'te': 'te',
    // --- don't care about line yet
    'ot': null,
    'og': null,
    'c': null,
    'c/g': null,
    'g': null,
    'g/t': null,
    't': null,
    'ol': null,
    // --- wtf
    's': null,
    'ss': null,
    'fs': null,
    'cb': null,
    'db': null,
    'lb': null,
    'ls': null,
    'lb/f': null,
    'nt': null,
    'de': null,
    'dt': null,
    'dl': null,
    'k': null,
    'p': null,
    'pk': null,
    'kr': null,
    '-': 'junk'
};

const positionGroups = {
    'qb': 'passing',
    'rb': 'running',
    'rb/w': 'running',
    'hb': 'running',
    'fb': 'running',
    'fb/d': 'running',
    'fb/r': 'running',
    'wr': 'catching',
    'wr/r': 'catching',
    'te': 'catching',
    // --- don't care about line yet
    'ot': null,
    'og': null,
    'c': null,
    'c/g': null,
    'g': null,
    'g/t': null,
    't': null,
    'ol': null,
    // --- wtf
    's': null,
    'ss': null,
    'fs': null,
    'cb': null,
    'db': null,
    'lb': null,
    'ls': null,
    'lb/f': null,
    'nt': null,
    'de': null,
    'dt': null,
    'dl': null,
    'k': null,
    'p': null,
    'pk': null,
    'kr': null,
    '-': 'junk'
};

async function createPlayerData(playerId: string): Promise<PlayerData> {
    const player = await readPlayer(playerId);

    let playerDisplay = null;
    let playerPosition = null;
    if (player.athlete){
        playerDisplay = playerLookup(playerId, player.athlete.displayName);
        playerPosition = player.athlete.position.abbreviation.toLowerCase();

        const playerPositionGroup = positionGroups[playerPosition];
        const playerPositionNorm = positionNormalization[playerPosition];
        if (playerPositionGroup){
            return {
                playerId,
                playerDisplay,
                playerPosition,
                playerPositionGroup,
                playerPositionNorm,
                passCmp: 0,
                passAtt: 0,
                passYds: 0,
                passTd: 0,
                passInt: 0,
                passLong: 0,
                passTargetYds: 0,
                sacked: 0,
                sackYds: 0,
                qbr: 0,
                aqbr: 0,
                rushAtt: 0,
                rushYds: 0,
                rushTd: 0,
                rushLong: 0,
                rushYdsBc: 0,
                rushYdsAc: 0,
                rushBrokenTackles: 0,
                recAtt: 0,
                recCmp: 0, 
                recYds: 0,
                recTd: 0,
                recDrops: 0,
                recLong: 0,
                recDepth: 0,
                recYac: 0,
                fumbles: 0,
                fumblesLost: 0
            };
        }
    } 
    
    return null;
}

function applyPassing(player: PlayerData, stats: Record<string, string>){
    const [comps, atts] = stats['completions/passingAttempts'].split('/');
    const [sacks, sackYds] = stats['sacks-sackYardsLost'].split('-');

    player.passCmp = parseInt(comps);
    player.passAtt = parseInt(atts);
    player.passYds = parseInt(stats['passingYards']);
    // yardsPerPassAttempt
    player.passTd = parseInt(stats['passingTouchdowns']);
    player.passInt = parseInt(stats['interceptions']);
    player.sacked = parseInt(sacks);
    player.sackYds = parseInt(sackYds);
    player.qbr = parseInt(stats['QBRating'])
    player.aqbr = parseInt(stats['adjQBR'])
    // player.passLong = 0;
    // player.passRating = 0;
    // player.passTargetYds = 0;
}

function applyRushing(player: PlayerData, stats: Record<string, string>){
    player.rushAtt = parseInt(stats['rushingAttempts']);
    player.rushYds = parseInt(stats['rushingYards']);
    player.rushTd = parseInt(stats['rushingTouchdowns']);
    player.rushLong = parseInt(stats['longRushing']);
    // player.rushYdsBc = 0;
    // player.rushYdsAc = 0;
    // player.rushBrokenTackles = 0;
}

function applyReceiving(player: PlayerData, stats: Record<string, string>){
    player.recAtt = parseInt(stats['receivingTargets']);
    player.recCmp = parseInt(stats['receptions']); 
    player.recYds = parseInt(stats['receivingYards']);
    player.recTd = parseInt(stats['receivingTouchdowns']);
    player.recLong = parseInt(stats['longReception']);
    // player.recDrops = 0;
    // player.recDepth = 0;
    // player.recYac = 0;
}

function applyFumbles(player: PlayerData, stats: Record<string, string>){
    player.fumbles = parseInt(stats['fumbles']);
    player.fumblesLost = parseInt(stats['fumblesLost']);
}

function getGameName(game: GameResponse){
    const teams = game.boxscore.teams;
    return `${teams[0].team.abbreviation} vs ${teams[1].team.abbreviation}`;
}

const teamMap = new Map<string, string>();
function teamLookup(id, display){
    if (teamMap.has(id)){
        return teamMap.get(id);
    } else {
        teamMap.set(id, display);
        return display;
    }
}

async function processGameStats(season: string, week: string, game: GameResponse): Promise<StoredGameData>{
    const gameName = getGameName(game);
    const competion = game.header.competitions[0];

    const rtn: StoredGameData = {
        season,
        week,
        gameId: game.header.id,
        gameDisplay: gameName,
        gameDate: competion.date,
        homeTeamId: 'string',
        homeTeamDisplay: 'string', 
        homeScore: 0, 
        awayTeamId: 'string',
        awayTeamDisplay: 'string',
        awayScore: 0,
        neutralField: competion.neutralSite
    };

    for (const competitor of competion.competitors){
        const display = teamLookup(competitor.team.id, competitor.team.abbreviation);

        if (competitor.homeAway === 'home'){
            rtn.homeTeamId = competitor.team.id;
            rtn.homeTeamDisplay = display;
            rtn.homeScore = parseInt(competitor.score);
        } else {
            rtn.awayTeamId = competitor.team.id;
            rtn.awayTeamDisplay = display;
            rtn.awayScore = parseInt(competitor.score);
        }
    }

    return rtn;
}

async function processGamePlayers(playersData: BoxscorePlayersInfo[]): Promise<TeamPlayersData[]>{
    return Promise.all(playersData.map(async (playersGroup) => {
        const playersBuilder = new Map<string, PlayerData>();
        const teamDisplay = teamLookup(
            playersGroup.team.id,
            playersGroup.team.abbreviation
        );

        for (const statsGroup of playersGroup.statistics){
            for (const athlete of statsGroup.athletes){
                const data = {};
                const playerId = athlete.athlete.id;

                for (const i in statsGroup.keys){
                    data[statsGroup.keys[i]] = athlete.stats[i]
                }

                let player = null;

                if (playersBuilder.has(playerId)){
                    player = playersBuilder.get(playerId);
                } else {
                    player = await createPlayerData(playerId);

                    playersBuilder.set(playerId, player);
                }

                if (!player){
                    continue;
                }

                if (statsGroup.name === 'passing'){
                    applyPassing(player, data);
                } else if (statsGroup.name === 'rushing'){
                    applyRushing(player, data);
                } else if (statsGroup.name === 'receiving'){
                    applyReceiving(player, data);
                } else if (statsGroup.name === 'fumbles'){
                    applyFumbles(player, data);
                } /* else if (statGroup.name === 'defensive'){

                }*/
            }
        }

        return {
            teamId: playersGroup.team.id,
            teamDisplay,
            players: Array.from(playersBuilder.values()).filter(player => player)
        };
    }));
}

function getGameKey(year: number|string, week: number|string){
    return `${year}-${week}`;
}

async function processGames(paths: string[]){
    const gameParquetPath = `${parquetDir}/games.parquet`;
    const playerParquetPath = `${parquetDir}/players.parquet`;
    const knownGames: Record<string, boolean> = {};
    const existingGameData: StoredGameData[] = [];
    const existingPlayersData: StoredPlayerData[] = [];

    try {
        if (fsSync.existsSync(playerParquetPath)){
            const reader = await parquet.ParquetReader.openFile(playerParquetPath);
            const cursor = reader.getCursor();
    
            // read all records from the file and print them
            let record: StoredPlayerData = null;
            while (record = await cursor.next()) {
                knownGames[record.gameId] = true;
                existingPlayersData.push(record);

                teamLookup(record.teamId, record.teamDisplay);
                playerLookup(record.playerId, record.playerDisplay);
            }

            await reader.close();

            console.log('teams loaded from cache');
        } else {
            console.log('no team cache found');
        }
    } catch(ex){
        console.log('failed to load team cache parquet');
    }

    try {
        if (fsSync.existsSync(gameParquetPath)){
            const reader = await parquet.ParquetReader.openFile(gameParquetPath);
            const cursor = reader.getCursor();
    
            // read all records from the file and print them
            let record: StoredGameData = null;
            while (record = await cursor.next()) {
                const gameKey = getGameKey(record.season, record.week);

                knownGames[record.gameId] = true;

                existingGameData.push(record);
            }

            await reader.close();

            console.log('games loaded from cache');
        } else {
            console.log('no game cache found');
        }
    } catch(ex){
        console.log('failed to load game cache parquet');
    }

    const games: GameResponse[] = await Promise.all(paths.map(
        async(absPath) => JSON.parse((await fs.readFile(absPath)).toString('utf-8'))
    ));

    const newPlayerGames: InteralPlayersData[] = [];
    const unknownGames = games.filter(game => {
        try {
            return !knownGames[game.header.id];
        } catch (ex) {
            console.log('failed to load', game);
            return false;
        }
    });

    for (const game of unknownGames) { 
        const gameName = getGameName(game);
        const season = formatSeason(game.header.season.year);
        const week = formatWeek(game.header.week);

        const newPlayersData: InteralPlayersData = {
            season,
            week,
            gameId: game.header.id,
            gameDisplay: gameName,
            gameDate: game.header.competitions[0].date,
            teams: await processGamePlayers(game.boxscore.players)
        };

        if (newPlayersData.teams.length){
            newPlayerGames.push(newPlayersData);
        } else {
            console.log('failed to load player data', newPlayersData);
        }
        
        // await sleep(500 + 1500 * Math.random());
    }

    try {
        const writer = await parquet.ParquetWriter.openFile(playerSchema, playerParquetPath);
        
        const newPlayerData: StoredPlayerData[] = newPlayerGames.flatMap(
            gameInfo => gameInfo.teams.flatMap(
                teamInfo => teamInfo.players.map(
                    player => Object.assign({
                        season: gameInfo.season, 
                        week: gameInfo.week,
                        gameId: gameInfo.gameId,
                        gameDisplay: gameInfo.gameDisplay,
                        gameDate: gameInfo.gameDate,
                        teamId: teamInfo.teamId,
                        teamDisplay: teamInfo.teamDisplay
                    }, player)
                )
            )
        )

        for(const playerInfo of existingPlayersData.concat(newPlayerData)){
            await writer.appendRow(playerInfo);
        }

        writer.close();

        console.log('saved players parquet');
    } catch(ex){
        console.log('failed to write');
        console.log(ex);
    }

    const newGameData = (await Promise.all(unknownGames.map(game => {
        const season = formatSeason(game.header.season.year);
        const week = formatWeek(game.header.week);

        return processGameStats(season, week, game);
    }))).filter(game => game.awayScore != 0 || game.homeScore != 0);

    try {
        const writer = await parquet.ParquetWriter.openFile(gameSchema, gameParquetPath);
        
        for(const gameInfo of existingGameData.concat(newGameData)){
            await writer.appendRow(gameInfo);
        }

        writer.close();

        console.log('saved games parquet');
    } catch(ex){
        console.log('failed to write');
    }
}

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const gamesDir = resolve(__dirname+'/../cache/games');

/*
recursiveFileStat([
    gamesDir+'/2023',
    gamesDir+'/2022',
    // gamesDir+'/2021'
]);
*/

recursiveFileStat(gamesDir)
.then(results => processGames(results));