import * as parquet from 'parquetjs-lite';

interface BaseIdetifiers {
    season: string, 
    week: string, 
}

export interface GameRow {
    gameId: string,
    gameDisplay: string,
    gameDate: string, 
    homeTeamId: string,
    homeTeamDisplay: string, 
    homeScore: number, 
    awayTeamId: string,
    awayTeamDisplay: string,
    awayScore: number,
    neutralField: boolean
}

export interface GameStats extends BaseIdetifiers {
    games: GameRow[]
}

export const gameSchema = new parquet.ParquetSchema({
    season: { type: 'UTF8' }, 
    week: { type: 'UTF8' }, 
    
    games: { 
        repeated: true,
        fields: {
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
        }
    }
});

export interface PlayerRow {
    playerId: string,
    playerDisplay: string,
    playerPosition: string,
    playerPositionGroup: string,
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

export interface BaseTeamIdentifiers extends BaseIdetifiers {
    gameId: string,
    gameDisplay: string,
    gameDate: string, 
}

export interface InternalTeamStats {
    teamId: string,
    teamDisplay: string,
    players: PlayerRow[]
}

export interface TeamStats extends InternalTeamStats, BaseTeamIdentifiers {

}

// TODO: Is there a way to generate this from an interface?
export const playerSchema = new parquet.ParquetSchema({
    season: { type: 'UTF8' }, 
    week: { type: 'UTF8' }, 
    gameId: { type: 'UTF8' },
    gameDisplay: { type: 'UTF8' },
    gameDate: { type: 'UTF8' }, 
    teamId: { type: 'UTF8' },
    teamDisplay: { type: 'UTF8' },

    players: { 
        repeated: true,
        fields: {
            playerId: { type: 'UTF8' },
            playerDisplay: { type: 'UTF8' },
            playerPosition: { type: 'UTF8' },
            playerPositionGroup: { type: 'UTF8' },
            passCmp: { type: 'INT32' },
            passAtt: { type: 'INT32' },
            passYds: { type: 'INT32' },
            passTd: { type: 'INT32' },
            passInt: { type: 'INT32' },
            passLong: { type: 'INT32' },
            passRating: { type: 'INT32' },
            passTargetYds: { type: 'INT32' },
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
            fumbles: { type: 'INT32' },
            fumblesLost: { type: 'INT32' }
        }
    }
});