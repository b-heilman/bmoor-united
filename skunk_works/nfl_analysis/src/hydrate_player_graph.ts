import * as fs from 'fs';
import * as path from 'path';
import * as parquet from 'parquetjs-lite';
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
    // --- wtf
    's': 'junk',
    'ss': 'junk',
    'fs': 'junk',
    'cb': 'junk',
    'db': 'junk',
    'lb': 'junk',
    'lb/f': 'junk',
    'nt': 'junk',
    'de': 'junk',
    'dt': 'junk',
    'c': 'junk',
    'c/g': 'junk',
    'g': 'junk',
    'g/t': 'junk',
    't': 'junk',
    'ol': 'junk',
    'k': 'junk',
    'p': 'junk'
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
            return row.teamId;
        }
    });

    playerLoader.addNodeGenerator({
        type: 'offense',
        parentRef: function(row: DataRow, prev: {ref: string}){
            return prev.ref;
        },
        ref: function(row: DataRow){
            return row.teamId+':off';
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
        ref: function(row: {pos: string, team: string}){
            const rtn = offUsages[row.pos.toLowerCase()];

            if (!rtn){
                throw new Error('usage: unknown position => '+ row.pos);
            }

            return row.team+':'+rtn;
        }
    });

    playerLoader.addNodeGenerator({
        type: 'position-group',
        parentRef: function(row: DataRow, prev: {ref: string}){
            return prev.ref;
        },
        ref: function(row: DataRow){
            return row.teamId+':'+row.playerPosition;
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
            return row.teamId;
        },
        ref: function(row: DataRow){
            return row.teamId+':def';
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
        path.join(__dirname, '../data/parquet/players.parquet')
    )

    // TODO: do this with a stream...
    const rows = [];
    const cursor = reader.getCursor();

    let record: TeamStats = null;
    while (record = await cursor.next()) {
        for (const player of record.players){
            player.season
            player.week
            player.gameId
            player.gamePosition
            player.playerId
            player.playerDisplay
            player.playerPosition

            rows.push(record);
        }
    }

    playerLoader.loadDimensionalJSON(graph, rows);
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
}

run();