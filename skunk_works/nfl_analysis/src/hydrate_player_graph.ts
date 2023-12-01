import * as fs from 'fs';
import * as path from 'path';
import * as parquet from 'parquetjs-lite';

import { Context } from '@bmoor/context';
import {DimensionalGraph, DimensionalGraphLoader, Interval, dump} from '@bmoor/graph-compute';

import { TeamStats } from './convert.interface';

const playerStats = [
    'passCmp',
    'passAtt',
    'passYds',
    'passTd',
    'passInt',
    'passLong',
    'passRating',
    'passTargetYds',
    // passPoor_throws"',
    // passBlitzed',
    // passHurried',
    // passScrambles',
    'rushAtt',
    'rushYds',
    'rushTd',
    'rushLong',
    'rushYdsBc',
    'rushYdsAc',
    'rushBrokenTackles',
    'recAtt',
    'recCmp', 
    'recYds',
    'recTd',
    'recDrops',
    'recLong',
    'recDepth',
    'recYac',
    'sacked',
    'fumbles',
    'fumblesLost'
];

type DataRow = {
    season: string, 
    week: string, 
    gameId: string,
    gameDate: string, 
    teamId: string,
    teamDisplay: string,
    playerId: string,
    playerDisplay: string,
    playerPosition: string,
};

// TODO: move this up stream
const offUsages = {
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
    'ot': 'o-line',
    'og': 'o-line',
    'c': 'o-line',
    'c/g': 'o-line',
    'g': 'o-line',
    'g/t': 'o-line',
    't': 'o-line',
    'ol': 'o-line',
    // --- wtf
    's': 'junk',
    'ss': 'junk',
    'fs': 'junk',
    'cb': 'junk',
    'db': 'junk',
    'lb': 'junk',
    'ls': 'junk',
    'lb/f': 'junk',
    'nt': 'junk',
    'de': 'junk',
    'dt': 'junk',
    'dl': 'junk',
    'k': 'junk',
    'p': 'junk',
    'pk': 'junk',
    'kr': 'junk',
    '-': 'junk'
};

/**
 * if (teamName.indexOf('ERROR') !== -1){
            teamName = 'WAS';
        }
 */
async function run(){
    const graph = new DimensionalGraph();
    const playerLoader = new DimensionalGraphLoader({
        generateInterval: function (dict: {season: string, week: string}) {
            const interval = new Interval(
                `${dict.season}-${dict.week}`,
                parseInt(`${dict.season}${dict.week}`)
            );

            return interval;
        },
    });

    playerLoader.addNodeGenerator({
        type: 'team',
        ref: function(row: DataRow){
            return row.teamDisplay;
        }
    });

    playerLoader.addNodeGenerator({
        type: 'offense',
        parentRef: function(row: DataRow, prev: {ref: string}){
            return prev.ref;
        },
        ref: function(row: DataRow){
            return row.teamDisplay+':off';
        },
        metadata: {
            side: 'off'
        }
    });

    playerLoader.addNodeGenerator({
        type: 'usage', // passing, running, throwing
        parentRef: function(row: DataRow, prev: {ref: string}){
            return prev.ref;
        },
        ref: function(row: DataRow){
            if (!row.playerPosition){
                console.log('bad position', row);
                throw new Error('no position defined');
            }

            const rtn = offUsages[row.playerPosition.toLowerCase()];

            if (!rtn){
                throw new Error('usage: unknown position => '+ row.playerPosition);
            }

            return row.teamDisplay+':'+rtn;
        }
    });

    playerLoader.addNodeGenerator({
        type: 'position-group',
        parentRef: function(row: DataRow, prev: {ref: string}){
            return prev.ref;
        },
        ref: function(row: DataRow){
            return row.teamDisplay+':'+row.playerPosition;
        }
    });

    playerLoader.addNodeGenerator({
        type: 'player',
        parentRef: function(row: DataRow, prev: {ref: string}){
            return prev.ref;
        },
        ref: function(row: DataRow){
           return row.playerId;
        },
        metadata: {
            position: function(row: DataRow){
                return row.playerPosition;
            }
        }
    });

    // This goes down here so I can load the offense with prev.ref
    playerLoader.addNodeGenerator({
        type: 'defense',
        parentRef: function(row: DataRow){
            return row.teamDisplay;
        },
        ref: function(row: DataRow){
            return row.teamDisplay+':def';
        }
    });

    playerLoader.addEventGenerator({
        ref: function(row: DataRow){
            return row.gameId;
        },
        connections: [
            {
                nodeRef: function(row: DataRow){
                    return row.playerId;
                },
                features: playerStats,
                featuresParser: (value) => {
                    return parseFloat(value);
                }
            },
        ]
    });
   
    const reader = await parquet.ParquetReader.openFile(
        path.join(__dirname, '../cache/players.parquet')
    )

    // TODO: do this with a stream...
    const rows = [];
    const cursor = reader.getCursor();
    const playerMap = new Map();

    let record: TeamStats = null;
    while (record = await cursor.next()) {
        let teamDisplay = null;
        // team displays can change, the team id shouldn't

        if (!record.players || record.players.length === 0){
            console.log('bad game', record.season, record.week, record.gameDisplay, record.gameId);
            continue;
        }

        for (const player of record.players){
            let playerDisplay = null;
            if (playerMap.has(player.playerId)){
                playerDisplay = playerMap.get(player.playerId);
            } else {
                playerDisplay = player.playerDisplay;
                playerMap.set(player.playerId, playerDisplay);
            }

            player.playerDisplay = playerDisplay;

            rows.push(Object.assign({
                season: record.season,
                week: record.week,
                gameDate: record.gameDate,
                gameId: record.gameId,
                gameDisplay: record.gameDisplay,
                teamId: record.teamId,
                teamDisplay: record.teamDisplay,
            }, player));
        }
    }

    const ctx = new Context({});

    try {
        playerLoader.loadDimensionalJSON(ctx, graph, rows);
        
        /*
        const dir = path.join(__dirname, `../data/seasons`);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        */
        fs.writeFileSync(
            path.join(__dirname, `../data/graph.json`),
            JSON.stringify(dump(graph), null, 2),
            {encoding: 'utf-8'}
        );
    } catch(ex){
        ctx.close();
    }
}

run();