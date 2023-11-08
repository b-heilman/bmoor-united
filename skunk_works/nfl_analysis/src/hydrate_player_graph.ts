import * as fs from 'fs';
import * as path from 'path';
import * as parquet from 'parquetjs-lite';
import {DimensionalGraph, DimensionalGraphLoader, Interval, dump} from '@bmoor/graph-compute';

const playerStats = [
    "pass_cmp",
    "pass_att",
    "pass_yds",
    "pass_td",
    "pass_int",
    "pass_sacked",
    "pass_long",
    "pass_rating",
    "pass_target_yds",
    "pass_poor_throws",
    "pass_blitzed",
    "pass_hurried",
    "pass_scrambles",
    "rush_att",
    "rush_yds",
    "rush_td",
    "rush_long",
    "rush_yds_before_contact",
    "rush_yac",
    "rush_broken_tackles",
    "rec_att",
    "rec_cmp", 
    "rec_yds",
    "rec_td",
    "rec_drops",
    "rec_long",
    "rec_air_yds",
    "rec_yac",
    "fumbles_lost"
];

type DataRow = {
    'game_date': string, 
    'season': string, 
    'week': string, 
    'game_id': string,
    'team': string,
    'player_id': string,
    'pos': string
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
            return row.team;
        }
    });

    playerLoader.addNodeGenerator({
        type: 'offense',
        parentRef: function(row: DataRow, prev: {ref: string}){
            return prev.ref;
        },
        ref: function(row: DataRow){
            return row.team+':off';
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
            return row.team+':'+row.pos;
        }
    });

    playerLoader.addNodeGenerator({
        type: 'player',
        parentRef: function(row: DataRow, prev: {ref: string}){
            return prev.ref;
        },
        ref: function(row: DataRow){
           return row.player_id;
        },
        metadata: {
            position: function(row: DataRow){
                return row.pos;
            }
        }
    });

    // This goes down here so I can load the offense with prev.ref
    playerLoader.addNodeGenerator({
        type: 'defense',
        parentRef: function(row: DataRow){
            return row.team;
        },
        ref: function(row: DataRow){
            return row.team+':def';
        }
    });

    playerLoader.addEventGenerator({
        ref: function(row: DataRow){
            return row.game_id;
        },
        connections: [
            {
                nodeRef: function(row: DataRow){
                    return row.player_id;
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

    let record = null;
    while (record = await cursor.next()) {
        rows.push(record);
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