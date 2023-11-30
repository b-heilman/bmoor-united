import * as fs from 'fs';
import * as path from 'path';
import * as parquet from 'parquetjs-lite';
import {DimensionalGraphLoader, Interval, dump, load} from '@bmoor/graph-compute';

import { GameStats } from './convert.interface';

type DataRow = {
    'season': string, 
    'week': string, 
    'gameDate': string, 
    'gameId': string, 
    // 'Vegas_Line': number,
    // 'Vegas_Favorite': string, 
    // 'Over_Under': number, 
    'homeTeamId': string, 
    'homeScore': number, 
    'awayTeamId': string,
    'awayScore': number
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
            return row.homeTeamId;
        },
        edges: {
            opponent: function (row: DataRow) {
                return [row.awayTeamId];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'offense',
        ref: function(row: DataRow){
            return row.homeTeamId+':off';
        },
        edges: {
            against: function (row: DataRow) {
                return [row.awayTeamId+':def'];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'defense',
        ref: function(row: DataRow){
            return row.homeTeamId+':def';
        },
        edges: {
            against: function (row: DataRow) {
                return [row.homeTeamId+':off'];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'team',
        ref: function(row: DataRow){
            return row.awayTeamId;
        },
        edges: {
            opponent: function (row: DataRow) {
                return [row.homeTeamId];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'offense',
        ref: function(row: DataRow){
            return row.awayTeamId+':off';
        },
        edges: {
            against: function (row: DataRow) {
                return [row.homeTeamId+':def'];
            },
        },
    });

    gameLoader.addNodeGenerator({
        type: 'defense',
        ref: function(row: DataRow){
            return row.awayTeamId+':def';
        },
        edges: {
            against: function (row: DataRow) {
                return [row.homeTeamId+':off'];
            },
        },
    });
    
    gameLoader.addEventGenerator({
        ref: function(row: DataRow){
            return row.gameId;
        },
        connections: [
            {
                nodeRef: function(row: DataRow){
                    return row.homeTeamId;
                },
                featureValues: {
                    score: (row: DataRow) => Number(row.homeScore),
                    win: (row: DataRow) => Number(row.homeScore > row.awayScore),
                    offset: (row: DataRow) => Number(row.homeScore - row.awayScore)
                }
            },
            {
                nodeRef: function(row: DataRow){
                    return row.awayTeamId;
                },
                featureValues: {
                    score: (row: DataRow) => Number(row.awayScore),
                    win: (row: DataRow) => Number(row.awayScore > row.homeScore),
                    offset: (row: DataRow) => Number(row.awayScore - row.homeScore)
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
    const teamMap = new Map();

    let record: GameStats = null;
    while (record = await cursor.next()) {
        for (const game of record.games){
            rows.push(Object.assign(
                {season: record.season, week: record.week},
                record
            ));
        }
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