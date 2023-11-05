import * as fs from 'fs';
import * as path from 'path';
import * as parquet from 'parquetjs-lite';
import {DimensionalGraphLoader, Interval, dump, load} from '@bmoor/graph-compute';

type DataRow = {
    'game_date': string, 
    'season': string, 
    'week': string, 
    'game_id': string, 
    'Vegas_Line': number,
    'Vegas_Favorite': string, 
    'Over_Under': number, 
    'home_team': string, 
    'home_score': number, 
    'vis_team': string,
    'vis_score': number
}

async function run(){

    const gameLoader = new DimensionalGraphLoader({
        generateInterval: function (dict: DataRow) {
            const interval = new Interval(
                `${dict.season}-${dict.week}`,
                parseInt(`${dict.season}${dict.week}`)
            );

            return interval;
        },
    });

    gameLoader.addNodeGenerator({
        type: 'team',
        ref: function(row: DataRow){
            return row.home_team;
        },
        edges: {
            opponent: function (row: DataRow) {
                return [row.vis_team];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'offsense',
        ref: function(row: DataRow){
            return row.home_team+':off';
        },
        edges: {
            against: function (row: DataRow) {
                return [row.vis_team+':def'];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'defense',
        ref: function(row: DataRow){
            return row.home_team+':def';
        },
        edges: {
            against: function (row: DataRow) {
                return [row.home_team+':off'];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'team',
        ref: function(row: DataRow){
            return row.vis_team;
        },
        edges: {
            opponent: function (row: DataRow) {
                return [row.home_team];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'offsense',
        ref: function(row: DataRow){
            return row.vis_team+':off';
        },
        edges: {
            against: function (row: DataRow) {
                return [row.home_team+':def'];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'defense',
        ref: function(row: DataRow){
            return row.vis_team+':def';
        },
        edges: {
            against: function (row: DataRow) {
                return [row.home_team+':off'];
            },
        },
    });
    
    gameLoader.addEventGenerator({
        ref: function(row: DataRow){
            return row.game_id;
        },
        connections: [
            {
                nodeRef: function(row: DataRow){
                    return row.home_team;
                },
                featureValues: {
                    score: (row: DataRow) => Number(row.home_score),
                    win: (row: DataRow) => Number(row.home_score > row.vis_score),
                    offset: (row: DataRow) => Number(row.home_score - row.vis_score)
                }
            },
            {
                nodeRef: function(row: DataRow){
                    return row.vis_team;
                },
                featureValues: {
                    score: (row: DataRow) => Number(row.vis_score),
                    win: (row: DataRow) => Number(row.vis_score > row.home_score),
                    offset: (row: DataRow) => Number(row.vis_score - row.home_score)
                }
            },
        ]
    });
   
    const reader = await parquet.ParquetReader.openFile(
        path.join(__dirname, '../data/parquet/games.parquet')
    )

    // TODO: do this with a stream...
    const rows = [];
    const cursor = reader.getCursor();

    let record = null;
    while (record = await cursor.next()) {
        rows.push(record);
    }

    const graph = load(JSON.parse(
        fs.readFileSync(path.join(__dirname, `../data/graph.json`), {encoding: 'utf-8'}),
    ));

    gameLoader.loadDimensionalJSON(graph, rows);

    fs.writeFileSync(
        path.join(__dirname, `../data/graph.json`),
        JSON.stringify(dump(graph), null, 2),
        {encoding: 'utf-8'}
    );
}

run();