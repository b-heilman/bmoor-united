import * as fs from 'fs';
import * as path from 'path';

import {
	calculateCompare,
	defenseProperties,
	offenseProperties,
	teamProperties,
} from './compute';
import {graph} from './features';
import { GraphView } from '@bmoor/graph';

const stats = {
	offense: Object.keys(offenseProperties),
	defense: Object.keys(defenseProperties),
	team: Object.keys(teamProperties),
	labels: [
		'win',
		// 'win by 4',
		// 'win by 7',
		// 'lose by 7',
		// 'lose by 4',
		// 'lose',
	],
};

const keys = [].concat(stats.offense, stats.defense, stats.team);

function reducePairing(res: Record<string, number>[]) {
	const compare = [];

	for (const row of res) {
		const props = [];
		for (const key of keys) {
			props.push(row[key]);
		}

		compare.push(props);
	}

	return compare;
}

async function createTraining(intervals) {
	const intervalRefs = [];
	const rtn = {
		stats,
		intervals: intervalRefs,
		features: {}, // [interval.ref][node.name]
		pairings: [
			// [${interval.ref}.${node.name}, ${interval.ref}.${node.name}]
		]
	};
	const history = []

	for (const interval of intervals) {
		console.log(interval);
		const weekGraph = graph.getGraph(interval);

		intervalRefs.push(interval.ref);

		const proc = [];
		const view = new GraphView();

		for (const ig of graph.getGraphSeries(
            interval, 
            graph.offsetInterval(interval, 5)
        )){
            view.addGraph(ig);
        };

        view.render();

		for (const event of weekGraph.eventDex.values()) {
			const nodes = event.getNodesByType('team');

			proc.push(
				calculateCompare(view, interval, nodes[0].ref, nodes[1].ref).then(
					(res: Record<string, number>[]) => {
						// This is where I drop name and score
						const compare = reducePairing(res);

						const diff = res[0].score - res[1].score;
						const labels = [
							diff > 0 ? 1 : 0, // win
							// diff >= 4 ? 1 : 0, // win by 4
							// diff >= 7 ? 1 : 0, // win by 7
							// diff <= -7 ? 1 : 0, // lost by 7
							// diff <= -4 ? 1 : 0, // lost by 4
							// diff < 0 ? 1 : 0, // lost
						];

						let intervalSpace = rtn.features[interval.ref];
						if (!intervalSpace){
							intervalSpace = {}
							rtn.features[interval.ref] = intervalSpace;
						}

						intervalSpace[res[0].name] = compare[0];
						intervalSpace[res[1].name] = compare[1];

						return {
							compare: [`${interval.ref}.${res[0].name}`, `${interval.ref}.${res[1].name}`],
							labels,
							tag: `${interval.ref}: ${res[0].name} vs ${res[1].name} => ${res[0].score} - ${res[1].score} ${diff}`,
						};
					},
				),
			);
		}

		await Promise.all(proc).then((rows) => {
			for (const row of rows) {
				rtn.pairings.push([row.compare, row.labels, row.tag]);
			}
		});
	}

	fs.writeFileSync(
		path.join(__dirname, `../data/training.json`),
		JSON.stringify(rtn, null, 2),
		{encoding: 'utf-8'},
	);

	return rtn;
}

interface AnalysisRequest {
	interval: string;
	compare: {
		team1: string;
		team2: string;
	}[];
}

async function createAnalysis(request: AnalysisRequest[]) {
	const rtn = {
		stats,
		content: [],
	};

	for (const intervalReq of request) {
		const interval = graph.getInterval(intervalReq.interval);

		console.log(interval);

		const proc = [];
		const view = new GraphView();

		for (const ig of graph.getGraphSeries(
            interval, 
            graph.offsetInterval(interval, 5)
        )){
            view.addGraph(ig);
        };

        view.render();

		for (const cmp of intervalReq.compare) {
			proc.push(
				calculateCompare(view, interval, cmp.team1, cmp.team2).then(
					(res: Record<string, number>[]) => {
						// This is where I drop name and score
						const compare = reducePairing(res);
						const diff = res[0].score - res[1].score;

						return {
							compare,
							tag: `base on ${interval.ref} predict ${res[0].name} vs ${res[1].name}`,
						};
					},
				),
			);
		}

		await Promise.all(proc).then((rows) => {
			for (const row of rows) {
				rtn.content.push([row.compare, null, row.tag]);
			}
		});
	}

	fs.writeFileSync(
		path.join(__dirname, `../data/analysis.json`),
		JSON.stringify(rtn, null, 2),
		{encoding: 'utf-8'},
	);

	return rtn;
}

const available = Array.from(graph.intervals.values());
const intervals = available.slice(13);

createTraining(intervals)
	.then(() =>
		createAnalysis([
			{
				interval: '2023-13',
				compare: [
					{
						team1: 'PHI',
						team2: 'DAL', // win
					},
					{
						team1: 'NE', // win
						team2: 'PIT',
					},
					{
						team1: 'TB', // win
						team2: 'ATL',
					},
					{
						team1: 'DET',
						team2: 'CHI', // win
					},
					{
						team1: 'IND',
						team2: 'CIN', // win
					},
					{
						team1: 'CAR',
						team2: 'NO', // win
					},
					{
						team1: 'HOU',
						team2: 'NYJ', // win
					},
					{
						team1: 'LAR',
						team2: 'BAL', // win
					},
					{
						team1: 'MIN', // win
						team2: 'LV',
					},
					{
						team1: 'SEA',
						team2: 'SF', // win
					},
					{
						team1: 'BUF', // win
						team2: 'KC',
					},
					{
						team1: 'DEN', // win
						team2: 'LAC',
					},
					{
						team1: 'TEN', // win
						team2: 'MIA',
					},
					{
						team1: 'GB',
						team2: 'NYG', // win
					},
				],
			},
			{
				interval: '2023-14',
				compare: [
					{
						team1: 'LAC',
						team2: 'LV',
					},
					{
						team1: 'MIN',
						team2: 'CIN',
					},
					{
						team1: 'PIT',
						team2: 'IND',
					},
					{
						team1: 'DEN',
						team2: 'DET',
					},
					{
						team1: 'NYG',
						team2: 'NO',
					},
					{
						team1: 'CHI',
						team2: 'CLE',
					},
					{
						team1: 'ATL',
						team2: 'CAR',
					},
					{
						team1: 'TB',
						team2: 'GB',
					},
					{
						team1: 'NYJ',
						team2: 'MIA',
					},
					{
						team1: 'KC',
						team2: 'NE',
					},
					{
						team1: 'HOU',
						team2: 'TEN',
					},
					{
						team1: 'SF',
						team2: 'ARI',
					},
					{
						team1: 'WSH',
						team2: 'LAR',
					},
					{
						team1: 'DAL',
						team2: 'BUF',
					},
					{
						team1: 'BAL',
						team2: 'JAX',
					},
					{
						team1: 'PHI',
						team2: 'SEA',
					},
				],
			},
		]),
	)
	.then(() => console.log('--done--'));

// TEN
