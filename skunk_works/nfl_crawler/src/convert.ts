import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as parquet from 'parquetjs-lite';

import { readPlayer, cacheDir } from './access';
import { GameResponse, BoxscorePlayersInfo } from './access.interface';
import { 
    PlayerRow, 
    GameRow, 
    InternalTeamStats, 
    TeamStats, 
    GameStats, 
    BaseTeamIdentifiers, 
    playerSchema, 
    gameSchema 
} from './convert.interface';

export const parquetDir = `${cacheDir}/parquet`;
if (!fsSync.existsSync(parquetDir)){
    fsSync.mkdirSync(parquetDir);
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function recursiveFileStat(path: string): Promise<string[]>{
    const stats = await fs.stat(path);

    if (stats.isDirectory()){
        const children = await fs.readdir(path);

        return (await Promise.all(children.map(child => recursiveFileStat(path+'/'+child)))).flat();
    } else {
        return [path];
    }
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

async function createPlayerRow(playerId: string): Promise<PlayerRow> {
    const player = await readPlayer(playerId);

    let playerDisplay = null;
    let playerPosition = null;
    if (player.athlete){
        playerDisplay = playerLookup(playerId, player.athlete.displayName);
        playerPosition = player.athlete.position.abbreviation;
    } else {
        playerDisplay = playerLookup(playerId, playerId);
        playerPosition = 'NA';
    }

    return {
        playerId,
        playerDisplay,
        playerPosition,
        passCmp: 0,
        passAtt: 0,
        passYds: 0,
        passTd: 0,
        passInt: 0,
        passLong: 0,
        passRating: 0,
        passTargetYds: 0,
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
        sacked: 0,
        fumbles: 0,
        fumblesLost: 0
    };
}

function applyPassing(player: PlayerRow, stats: Record<string, string>){
    const [comps, atts] = stats['completions/passingAttempts'].split('/');
    const [sacks] = stats['sacks-sackYardsLost'].split('-');

    player.passCmp = parseInt(comps);
    player.passAtt = parseInt(atts);
    player.passYds = parseInt(stats['passingYards']);
    // yardsPerPassAttempt
    player.passTd = parseInt(stats['passingTouchdowns']);
    player.passInt = parseInt(stats['interceptions']);
    player.sacked = parseInt(sacks);
    // player.passLong = 0;
    // player.passRating = 0;
    // player.passTargetYds = 0;
}

function applyRushing(player: PlayerRow, stats: Record<string, string>){
    player.rushAtt = parseInt(stats['rushingAttempts']);
    player.rushYds = parseInt(stats['rushingYards']);
    player.rushTd = parseInt(stats['rushingTouchdowns']);
    // player.rushLong = 0;
    // player.rushYdsBc = 0;
    // player.rushYdsAc = 0;
    // player.rushBrokenTackles = 0;
}

function applyReceiving(player: PlayerRow, stats: Record<string, string>){
    player.recAtt = parseInt(stats['receivingTargets']);
    player.recCmp = parseInt(stats['receptions']); 
    player.recYds = parseInt(stats['receivingYards']);
    player.recTd = parseInt(stats['receivingTouchdowns']);
    // player.recDrops = 0;
    // player.recLong = 0;
    // player.recDepth = 0;
    // player.recYac = 0;
}

function applyFumbles(player: PlayerRow, stats: Record<string, string>){
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

async function processGameStats(game: GameResponse): Promise<GameRow>{
    const gameName = getGameName(game);
    const competion = game.header.competitions[0];

    const rtn: GameRow = {
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
        } else {
            rtn.awayTeamId = competitor.team.id;
            rtn.awayTeamDisplay = display;
        }
    }

    return rtn;
}

async function processGamePlayers(playersData: BoxscorePlayersInfo[]): Promise<InternalTeamStats[]>{
    return Promise.all(playersData.map(async (playersGroup) => {
        const playersBuilder = new Map<string, PlayerRow>();
        const teamDisplay = teamLookup(
            playersGroup.team.id,
            playersGroup.team.abbreviation
        );
        const teamInfo: InternalTeamStats = {
            teamId: playersGroup.team.id,
            teamDisplay,
            players: []
        };

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
                    player = await createPlayerRow(playerId);

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

        teamInfo.players = Array.from(playersBuilder.values());

        return teamInfo;
    }));
}

function getGameKey(year: number|string, week: number|string){
    return `${year}-${week}`;
}

async function processGames(paths: string[]){
    const gameParquetPath = `${parquetDir}/games.parquet`;
    const playerParquetPath = `${parquetDir}/players.parquet`;
    const knownTeams: Record<string, boolean> = {};
    const knownGames: Record<string, boolean> = {};
    const existingGames: Record<string, GameStats> = {};
    const existingTeamsGames: TeamStats[] = [];

    try {
        if (fsSync.existsSync(playerParquetPath)){
            const reader = await parquet.ParquetReader.openFile(playerParquetPath);
            const cursor = reader.getCursor();
    
            // read all records from the file and print them
            let record: TeamStats = null;
            while (record = await cursor.next()) {
                knownTeams[record.gameId] = true;
                existingTeamsGames.push(record);

                teamLookup(record.teamId, record.teamDisplay);
                for (const player of record.players){
                    playerLookup(player.playerId, player.playerDisplay);
                }
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
            let record: GameStats = null;
            while (record = await cursor.next()) {
                for (const game of record.games){
                    knownGames[game.gameId] = true;
                }

                existingGames[getGameKey(record.season, record.week)] = record;
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

    const teamResults: TeamStats[][] = [];
    for (const game of games.filter(game => !knownTeams[game.header.id])) { 
        const gameName = getGameName(game);

        const base: BaseTeamIdentifiers = {
            season: game.header.season.year,
            week: game.header.week, // TODO: this will fail when I start using post season
            gameId: game.header.id,
            gameDisplay: gameName,
            gameDate: game.header.competitions[0].date,
        };

        console.log('processing team', base);

        const playersData = await processGamePlayers(game.boxscore.players);
        
        teamResults.push(playersData.map(teamData => Object.assign(teamData, base)));

        await sleep(500 + 1500 * Math.random());
    }

    try {
        const writer = await parquet.ParquetWriter.openFile(playerSchema, playerParquetPath);
        
        for(const teamInfo of existingTeamsGames.concat(teamResults.flat())){
            await writer.appendRow(teamInfo);
        }

        writer.close();

        console.log('saved players parquet');
    } catch(ex){
        console.log('failed to write');
    }

    for (const game of games.filter(game => !knownGames[game.header.id])) { 
        const key = getGameKey(game.header.season.year, game.header.week);

        let base: GameStats = null;

        if (existingGames[key]){
            base = existingGames[key];
        } else {
            base = {
                season: game.header.season.year,
                week: game.header.week, // TODO: this will fail when I start using post season
                games: []
            };

            existingGames[key] = base;
        }

        console.log('processing game', key);
        base.games.push(await processGameStats(game));
        // I don't need to pause here since the game SHOULD be cached already
    }

    try {
        const writer = await parquet.ParquetWriter.openFile(gameSchema, gameParquetPath);
        
        for(const gameInfo of Object.values(existingGames)){
            await writer.appendRow(gameInfo);
        }

        writer.close();

        console.log('saved games parquet');
    } catch(ex){
        console.log('failed to write');
    }
}

recursiveFileStat('/home/brian/development/bmoor-united/skunk_works/nfl_crawler/cache/games')
.then(results => processGames(results));

// processGames(['/home/brian/development/bmoor-united/skunk_works/nfl_crawler/cache/games/2023/11/401547545.json']);