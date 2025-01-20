import {default as parquet} from 'parquetjs-lite';

interface SeasonWeekIdentifiers {
    season: string, 
    week: string, 
}

interface GameReference {
    gameId: string
}

export interface PlayerReference {
    playerId: string,
    playerDisplay: string,
}

export interface PlayData {
    type: string,
    distance: number,
    result: string
}

export interface DriveData extends GameReference {
    teamId: string,
    teamDisplay: string,
    startTime: number,
    stopTime: number,
    startYards: number,
    stopYards: number,
    rushes: number,
    passes: number,
    points: number,
    turnover: boolean,
    plays: PlayData[]
}

export interface DriveStorageData extends SeasonWeekIdentifiers, DriveData {

}

export const driveSchema = new parquet.ParquetSchema({
    season: { type: 'INT32' }, 
    week: { type: 'INT32' }, 
    gameId: { type: 'UTF8' },
    startTime: { type: 'INT32' },
    stopTime: { type: 'INT32' },
    startYards: { type: 'INT32' },
    stopYards: { type: 'INT32' },
    rushes: { type: 'INT32' },
    passes: { type: 'INT32' },
    points: { type: 'INT32' },
    turnover: { type: 'BOOLEAN' },
    plays: {
        repeated: true,
        fields: {
            type: { type: 'UTF8' },
            distance: { type: 'INT32' },
            result: { type: 'UTF8' },
        }
    }
});

interface GameIdentifiers extends GameReference {
    gameDisplay: string,
    gameDate: string, 
}

export interface GameData extends GameIdentifiers {
    homeTeamId: string,
    homeTeamDisplay: string, 
    homeScore: number,
    awayTeamId: string,
    awayTeamDisplay: string,
    awayScore: number,
    neutralField: boolean
}

export interface InternalGameData extends SeasonWeekIdentifiers {
    games: GameData[]
}

export interface GameStorageData extends SeasonWeekIdentifiers, GameData {

}

export const gameSchema = new parquet.ParquetSchema({
    season: { type: 'INT32' }, 
    week: { type: 'INT32' }, 
    gameId: { type: 'UTF8' },
    gameDisplay: { type: 'UTF8' },
    gameDate: { type: 'UTF8' }, 
    homeTeamId: { type: 'UTF8' },
    homeTeamDisplay: { type: 'UTF8' },
    homeScore: { type: 'INT32' },
    awayTeamId: { type: 'UTF8' },
    awayTeamDisplay: { type: 'UTF8' },
    awayScore: { type: 'INT32' },
    neutralField: { type: 'BOOLEAN' },
});

export interface PlayerData extends PlayerReference {
    playerPosition: string,
    playerPositionGroup: string,
    playerPositionNorm: string,

    passCmp: number,
    passAtt: number,
    passYds: number,
    passTd: number,
    passInt: number,
    passLong: number,
    passTargetYds: number,
    qbr: number,
    aqbr: number,
    
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
    sackYds: number,
    fumbles: number,
    fumblesLost: number
};

export interface TeamIdentifiers {
    teamId: string,
    teamDisplay: string,
}

export interface TeamPlayersData extends TeamIdentifiers {
    players: PlayerData[]
}

export interface InteralPlayersData extends SeasonWeekIdentifiers, GameIdentifiers {
    teams: TeamPlayersData[], 
}

export interface PlayerStorageData extends TeamIdentifiers, SeasonWeekIdentifiers, GameIdentifiers, PlayerData {

}

// TODO: Is there a way to generate this from an interface?
export const playerSchema = new parquet.ParquetSchema({
    season: { type: 'INT32' }, 
    week: { type: 'INT32' }, 
    gameId: { type: 'UTF8' },
    gameDisplay: { type: 'UTF8' },
    gameDate: { type: 'UTF8' }, 
    teamId: { type: 'UTF8' },
    teamDisplay: { type: 'UTF8' },
    playerId: { type: 'UTF8' },
    playerDisplay: { type: 'UTF8' },
    playerPosition: { type: 'UTF8' },
    playerPositionGroup: { type: 'UTF8' },
    playerPositionNorm: { type: 'UTF8' },

    passCmp: { type: 'INT32' },
    passAtt: { type: 'INT32' },
    passYds: { type: 'INT32' },
    passTd: { type: 'INT32' },
    passInt: { type: 'INT32' },
    passLong: { type: 'INT32' },
    qbr: { type: 'INT32' },
    aqbr: { type: 'INT32' },

    // passPoor_throws": number,
    // passBlitzed: number,
    // passHurried: number,
    // passScrambles: number,
    rushAtt: { type: 'INT32' },
    rushYds: { type: 'INT32' },
    rushTd: { type: 'INT32' },
    rushLong: { type: 'INT32' },
    rushYdsBc: { type: 'INT32' },
    rushYdsAc: { type: 'INT32' },
    rushBrokenTackles: { type: 'INT32' },

    recAtt: { type: 'INT32' },
    recCmp: { type: 'INT32' }, 
    recYds: { type: 'INT32' },
    recTd: { type: 'INT32' },
    recDrops: { type: 'INT32' },
    recLong: { type: 'INT32' },
    recDepth: { type: 'INT32' },
    recYac: { type: 'INT32' },

    sacked: { type: 'INT32' },
    sackYds: { type: 'INT32' },
    fumbles: { type: 'INT32' },
    fumblesLost: { type: 'INT32' }
});