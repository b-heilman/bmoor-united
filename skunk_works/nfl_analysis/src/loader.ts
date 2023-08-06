const fs = require('fs');
const path = require('path');
const parquet = require('parquetjs-lite');
const {Graph, dump, GraphLoader} = require('@bmoor/graph');

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
    "rush_scrambles",
    "rush_att",
    "rush_yds",
    "rush_td",
    "rush_long",
    "rush_yds_before_contact",
    "rush_yac",
    "rush_broken_tackles",
    "targets",
    "rec", 
    "rec_yds",
    "rec_td",
    "rec_drops",
    "rec_long",
    "rec_air_yds",
    "rec_yac",
    "fumbles_lost"
];

/**
 * if (teamName.indexOf('ERROR') !== -1){
            teamName = 'WAS';
        }
 */
async function run(){
    const graph = new Graph();
    const playerLoader = new GraphLoader(graph, {
        nodes: [
            {
                type: 'team',
                reference: function(row){
                    const rtn = row.team;

                    if (!rtn){
                        console.log(JSON.stringify(row, null, '\t'));
                        throw new Error('unknown team => '+row.team);
                    }

                    return rtn;
                }
            },
            {
                type: 'side-of-ball', // offense vs defense
                reference: function(row){
                    return row.team+':off';
                }
            },
            {
                type: 'usage', // passing, running, throwing
                reference: function(row){
                    const rtn = offUsages[row.pos.toLowerCase()];

                    if (!rtn){
                        // console.log(JSON.stringify(row, null, '\t'));
                        throw new Error('usage: unknown position => '+ row.pos);
                    }

                    return row.team+':'+rtn;
                }
            },
            {
                type: 'position-group',
                reference: function(row){
                    return row.team+':'+row.pos;
                }
            },
            {
                type: 'player',
                reference: {
                    mount: 'player_id'
                },
                tag: (row) => row.pos.toLowerCase(),
                normalizer: (row) => {
                    return playerStats.reduce(
                        (agg, key) => {
                            const value = row[key];

                            agg[key] = value ? Number(value) : null;

                            return agg;
                        },
                        {}
                    );
                }
            }
        ],
        event: {
            reference: {
                mount: 'game_id'
            },
            interval: function(row) {
                return parseInt(row.season) * 100 + parseInt(row.week);
            }
        }
    });
    
    const reader = await parquet.ParquetReader.openFile(
        path.join(__dirname, '../data/parquet/players.parquet')
    )

    // TODO: do this with a stream...
    const cursor = reader.getCursor();

    let record = null;
    while (record = await cursor.next()) {
        playerLoader.addRow(record);
    }

    const dir = path.join(__dirname, `../data/seasons`);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    fs.writeFileSync(
        path.join(__dirname, `../data/graph.json`),
        dump(graph)
    );
}

run();