import * as fs from 'fs/promises';
import { readPlayer, GameResponse } from './access';

type GameRow = {
    gameDate: string, 
    season: string, 
    week: string, 
    gameId: string, 
    homeTeam: string, 
    homeScore: number, 
    visTeam: string,
    visScore: number,
    neutralField: boolean
}

interface PlayerSeed {
    gameDate: string, 
    season: number, 
    week: number, 
    gameId: string,
    gameDisplay: string,
    teamId: string,
    teamDisplay: string,
    playerId: string,
}

interface PlayerRow extends PlayerSeed {
    playerDisplay: string,
    pos: string,
    passCmp: number,
    passAtt: number,
    passYds: number,
    passTd: number,
    passInt: number,
    passLong: number,
    passRating: number,
    passTargetYds: number,
    // passPoor_throws": number,
    // passBlitzed: number,
    // passHurried: number,
    // passScrambles: number,
    rushAtt: number,
    rushYds: number,
    rushTd: number,
    rushLong: number,
    rushYdsBc: number,
    rushYdsAc: number,
    rushBrokenTackles: number,
    recAtt: number,
    recCmp: number, 
    recYds: number,
    recTd: number,
    recDrops: number,
    recLong: number,
    recDepth: number,
    recYac: number,
    sacked: number,
    fumbles: number,
    fumblesLost: number
};

async function createPlayerRow(
    seed: {
        gameDate: string, 
        season: number, 
        week: number, 
        gameId: string,
        gameDisplay: string,
        teamId: string,
        teamDisplay: string,
        playerId: string
    }
): Promise<PlayerRow> {
    const player = await readPlayer(seed.playerId);

    if (player.athlete){
        return Object.assign({
            playerDisplay: player.athlete.displayName,
            pos: player.athlete.position.abbreviation,
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
        },seed);
    } else {
        return null;
    }
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
    player.fumbles = parseInt(stats['receivingTargets']);
    player.fumblesLost = parseInt(stats['receivingTargets']);
}

async function convertJson(absPath: string){
    const game: GameResponse = JSON.parse((await fs.readFile(absPath)).toString('utf-8'));
    const playersData = game.boxscore.players;
    
    const teams = game.boxscore.teams;
    const gameName = `${teams[0].team.abbreviation} vs ${teams[1].team.abbreviation}`;

    const playersBuilder = new Map<string, PlayerRow>();

    for (const playersGroup of playersData){
        const seed: PlayerSeed = {
            gameDate: game.header.competitions[0].date,
            season: game.header.season.year,
            week: game.header.week, // TODO: this will fail when I start using post season
            gameId: game.header.id,
            gameDisplay: gameName,
            teamId: playersGroup.team.id,
            teamDisplay: playersGroup.team.abbreviation,
            playerId: 'todo'
        };

        for (const statsGroup of playersGroup.statistics){
            for (const athlete of statsGroup.athletes){
                const data = {};
                const playerId = athlete.athlete.id;

                seed.playerId = playerId;
                for (const i in statsGroup.keys){
                    data[statsGroup.keys[i]] = athlete.stats[i]
                }

                let player = null;

                if (playersBuilder.has(playerId)){
                    player = playersBuilder.get(playerId);
                } else {
                    player = createPlayerRow(seed);

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
                }
            }
             /* else if (statGroup.name === 'defensive'){

            }*/
        }

        createPlayerRow({
            gameDate: game.header.competitions[0].date,
            season: game.header.season.year,
            week: game.header.week, // TODO: this will fail when I start using post season
            gameId: game.header.id,
            gameDisplay: gameName,
            teamId: playersGroup.team.id,
            teamDisplay: playersGroup.team.abbreviation,
            playerId: 'todo'
        });
    }
}

convertJson('/home/brian/development/bmoor-united/skunk_works/nfl_crawler/cache/games/2023/11/401547545.json');