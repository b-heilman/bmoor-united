import * as fs from 'fs';
import * as parquet from 'parquetjs-lite';
import * as path from 'path';

import {Context} from '@bmoor/context';
import {
	GraphComputeLoader,
	Interval,
	dump,
	load,
} from '@bmoor/graph-compute';

import {GameStats} from './convert.interface';

// TODO: add row structure as type
type DataRow = {
	season: number;
	week: number;
	gameDate: string;
	gameId: string;
	// 'Vegas_Line': number,
	// 'Vegas_Favorite': string,
	// 'Over_Under': number,
	homeTeamDisplay: string;
	homeScore: number;
	awayTeamDisplay: string;
	awayScore: number;
};

async function run() {
	const gameLoader = new GraphComputeLoader({
		generateInterval: function (dict: DataRow) {
			const interval = new Interval(
				`${dict.season}-${dict.week}`,
				parseInt(`${dict.season}${dict.week}`),
			);

			return interval;
		},
	});

	gameLoader.addNodeGenerator({
		type: 'team',
		ref: function (row: DataRow) {
			return row.homeTeamDisplay;
		},
		edges: {
			opponent: function (row: DataRow) {
				return [row.awayTeamDisplay];
			},
		},
	});

	gameLoader.addNodeGenerator({
		type: 'offense',
		ref: function (row: DataRow) {
			return row.homeTeamDisplay + ':off';
		},
		edges: {
			against: function (row: DataRow) {
				return [row.awayTeamDisplay + ':def'];
			},
		},
	});

	gameLoader.addNodeGenerator({
		type: 'defense',
		ref: function (row: DataRow) {
			return row.homeTeamDisplay + ':def';
		},
		edges: {
			against: function (row: DataRow) {
				return [row.awayTeamDisplay + ':off'];
			},
		},
	});

	gameLoader.addNodeGenerator({
		type: 'team',
		ref: function (row: DataRow) {
			return row.awayTeamDisplay;
		},
		edges: {
			opponent: function (row: DataRow) {
				return [row.homeTeamDisplay];
			},
		},
	});

	gameLoader.addNodeGenerator({
		type: 'offense',
		ref: function (row: DataRow) {
			return row.awayTeamDisplay + ':off';
		},
		edges: {
			against: function (row: DataRow) {
				return [row.homeTeamDisplay + ':def'];
			},
		},
	});

	gameLoader.addNodeGenerator({
		type: 'defense',
		ref: function (row: DataRow) {
			return row.awayTeamDisplay + ':def';
		},
		edges: {
			against: function (row: DataRow) {
				return [row.homeTeamDisplay + ':off'];
			},
		},
	});

	gameLoader.addEventGenerator({
		ref: function (row: DataRow) {
			return row.gameId;
		},
		connections: [
			{
				nodeRef: function (row: DataRow) {
					return row.homeTeamDisplay;
				},
				featureValues: {
					display: (row: DataRow) => row.homeTeamDisplay,
					score: (row: DataRow) => Number(row.homeScore),
					win: (row: DataRow) => Number(row.homeScore > row.awayScore),
					offset: (row: DataRow) => Number(row.homeScore - row.awayScore),
				},
			},
			{
				nodeRef: function (row: DataRow) {
					return row.awayTeamDisplay;
				},
				featureValues: {
					display: (row: DataRow) => row.awayTeamDisplay,
					score: (row: DataRow) => Number(row.awayScore),
					win: (row: DataRow) => Number(row.awayScore > row.homeScore),
					offset: (row: DataRow) => Number(row.awayScore - row.homeScore),
				},
			},
		],
	});

	const reader = await parquet.ParquetReader.openFile(
		path.join(__dirname, '../cache/games.parquet'),
	);

	// TODO: do this with a stream...
	const rows = [];
	const cursor = reader.getCursor();

	let record: GameStats = null;
	while ((record = await cursor.next())) {
		for (const game of record.games) {
			rows.push(
				Object.assign({season: record.season, week: record.week}, game),
			);
		}
	}

	const ctx = new Context({});
	try {
		const graph = load(
			ctx,
			JSON.parse(
				fs.readFileSync(path.join(__dirname, `../data/graph.json`), {
					encoding: 'utf-8',
				}),
			),
		);

		gameLoader.loadDimensionalJSON(ctx, graph, rows);

		fs.writeFileSync(
			path.join(__dirname, `../data/graph.json`),
			JSON.stringify(dump(graph), null, 2),
			{encoding: 'utf-8'},
		);
	} catch (ex) {
		ctx.close();
	}
}

run();
