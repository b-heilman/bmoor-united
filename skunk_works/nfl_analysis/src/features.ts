import * as fs from 'fs';
import * as path from 'path';

import { Context } from '@bmoor/context';
import {mean, sum} from '@bmoor/compute';
import {GraphDatum} from '@bmoor/graph';
import {
	DimensionalDatumAccessor as Accessor,
	DimensionalExecutor,
	DimensionalDatumProcessor as Processor,
	DimensionalDatumRanker as Ranker,
	load,
} from '@bmoor/graph-compute';

const ctx = new Context({});
export const graph = load(
	ctx,
	JSON.parse(
		fs.readFileSync(path.join(__dirname, `../data/graph.json`), {
			encoding: 'utf-8',
		}),
	),
);
/*
console.log('-----');
console.log(
	(<GraphDatum>graph.select(graph.getInterval('2023-12'), {reference: 'PHI:def'})[0]).node
);
console.log(
	(<GraphDatum>graph.select(graph.getInterval('2023-12'), {reference: 'PHI:off'})[0]).node
);
*/
export const executor = new DimensionalExecutor(graph);

export const offPass = new Processor('off-pass', sum, [
	{
		input: new Accessor({
			value: 'passYds',
		}),
		select: {
			type: 'player',
		},
	},
]);

export const offPassLast = new Processor('off-pass-last', ((d: number) => d), [
	{
		offset: -1,
		input: offPass,
	},
]);

export const offPassMean = new Processor('off-pass-mean', mean, [
	{
		input: offPassLast,
		range: 5,
	},
]);

export const offRush = new Processor('off-rush', sum, [
	{
		input: new Accessor({
			value: 'rushYds',
		}),
		select: {
			type: 'player',
		},
	},
]);

export const offRushLast = new Processor('off-rush-last', ((d: number) => d), [
	{
		offset: -1,
		input: offRush,
	},
]);

export const offRushMean = new Processor('off-rush-mean', mean, [
	{
		input: offRushLast,
		range:  5,
	},
]);

export const defRush = new Processor('def-rush', v => v[0], [
	{
		input: offRush,
		select: {
			assume: 'defense',
			edge: 'against'
		},
	}
]);

export const defRushLast = new Processor('def-rush-last', (d: number) => d, [
	{
		offset: -1,
		input: defRush,
	},
]);

export const defRushMean = new Processor('def-rush-mean', mean, [
	{
		input: defRushLast,
		range:  5,
		select: {
			assume: 'defense'
		}
	},
]);

export const defPass = new Processor('def-pass', v => v[0], [
	// TODO: how do I make this always read from the defense?
	{
		input: offPass,
		select: {
			assume: 'defense',
			edge: 'against'
		},
	}
]);

export const defPassLast = new Processor('def-pass-last', (d: number) => d, [
	{
		offset: -1,
		input: defPass,
	},
]);

export const defPassMean = new Processor('def-pass-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: defPassLast,
		range:  5,
		select: {
			assume: 'defense'
		}
	},
]);

export const offRushRank = new Ranker(
	'off-rush-rank', 
	{
		bucketsCount: 6,
		select: {
			global: true,
			type: 'offense'
		}
	},
	(input: number) => input,
	[
		{ input: offRushMean }
	]
);

export const offPassRank = new Ranker(
	'off-pass-rank', 
	{
		bucketsCount: 6,
		select: {
			global: true,
			type: 'offense'
		}
	},
	(input: number) => input,
	[
		{ input: offPassMean }
	]
);

export const offRank = new Ranker(
	'off-rank', 
	{
		asc: true,
		bucketsCount: 6,
		select: {
			global: true,
			type: 'offense'
		}
	},
	(pass: number, rush: number) => pass + rush,
	[
		{ input: offPassRank },
		{ input: offRushRank }
	]
);

export const defRushRank = new Ranker(
	'def-rush-rank', 
	{
		bucketsCount: 6,
		select: {
			global: true,
			type: 'defense'
		}
	},
	(input: number) => input,
	[
		{ input: defRushMean }
	]
);

export const defPassRank = new Ranker(
	'def-pass-rank', 
	{
		bucketsCount: 6,
		select: {
			global: true,
			type: 'defense'
		}
	},
	(input: number) => input,
	[
		{ input: defPassMean }
	]
);

export const defRank = new Ranker(
	'def-rank', 
	{
		asc: true,
		bucketsCount: 6,
		select: {
			global: true,
			type: 'defense'
		}
	},
	(pass: number, rush: number) => pass + rush,
	[
		{ input: defPassRank },
		{ input: defRushRank }
	]
);

export const teamRank = new Ranker(
	'team-rank', 
	{
		asc: true,
		bucketsCount: 6,
		select: {
			global: true,
			type: 'team'
		}
	},
	(def: number[], off: number[]) => def[0] + off[0],
	[
		{ input: defRank, select: {type: 'defense'} },
		{ input: offRank, select: {type: 'offense'} }
	]
);

export const offRushWin = new Processor('off-rush-win', 
	(
		[our]: {yards: number, rank: number}[],
		[their]: {mean: number, rank: number}[]
	) => {
		if (our.rank < their.rank){
			return our.yards > their.mean ? 2 : -1;
		} else if (our.rank > their.rank){
			return our.yards > their.mean ? 1 : -2;
		} else {
			return our.yards > their.mean ? 1 : 0;
		}

		return 0;
	}, [
		{
			input: new Accessor({
				yards: offRush,
				rank: offRushRank
			}),
			select: {
				assume: 'team',
				type: 'offense'
			},
		},
		{
			input: new Accessor({
				mean: defRushMean,
				rank: defRushRank,
			}),
			select: {
				assume: 'team',
				edge: 'opponent',
				type: 'defense'
			},
		},
	]
);

export const offRushWins = new Processor('off-rush-win-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: offRushWin,
		range:  5,
		select: {
			assume: 'team' // make this implicit
		}
	},
]);

export const offPassWin = new Processor('off-pass-win', 
	(
		[our]: {yards: number, rank: number}[],
		[their]: {mean: number, rank: number}[]
	) => {
		if (our.rank < their.rank){
			return our.yards > their.mean ? 2 : -1;
		} else if (our.rank > their.rank){
			return our.yards > their.mean ? 1 : -2;
		} else {
			return our.yards > their.mean ? 1 : 0;
		}

		return 0;
	}, [
		{
			input: new Accessor({
				yards: offPass,
				rank: offPassRank
			}),
			select: {
				assume: 'team',
				type: 'offense'
			},
		},
		{
			input: new Accessor({
				mean: defPassMean,
				rank: defPassRank,
			}),
			select: {
				assume: 'team',
				edge: 'opponent',
				type: 'defense'
			},
		},
	]
);

export const offPassWins = new Processor('off-pass-win-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: offPassWin,
		range:  5,
		select: {
			assume: 'team' // make this implicit
		}
	},
]);

export const defRushWin = new Processor('def-rush-win', 
	(
		[our]: {yards: number, rank: number}[],
		[their]: {mean: number, rank: number}[]
	) => {
		if (our.rank < their.rank){
			return our.yards < their.mean ? 2 : -1;
		} else if (our.rank > their.rank){
			return our.yards < their.mean ? 1 : -2;
		} else {
			return our.yards < their.mean ? 1 : 0;
		}

		return 0;
	}, [
		{
			input: new Accessor({
				yards: defRush,
				rank: defRushRank
			}),
			select: {
				assume: 'team',
				type: 'defense',
			},
		},
		{
			input: new Accessor({
				mean: offRushMean,
				rank: offRushRank,
			}),
			select: {
				assume: 'team',
				edge: 'opponent',
				type: 'offense'
			},
		},
	]
);

export const defRushWins = new Processor('def-rush-win-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: defRushWin,
		range:  5,
		select: {
			assume: 'team' // make this implicit
		}
	},
]);

export const defPassWin = new Processor('def-pass-win', 
	(
		[our]: {yards: number, rank: number}[],
		[their]: {mean: number, rank: number}[]
	) => {
		if (our.rank < their.rank){
			return our.yards < their.mean ? 2 : -1;
		} else if (our.rank > their.rank){
			return our.yards < their.mean ? 1 : -2;
		} else {
			return our.yards < their.mean ? 1 : 0;
		}

		return 0;
	}, [
		{
			input: new Accessor({
				yards: defPass,
				rank: defPassRank
			}),
			select: {
				assume: 'team',
				type: 'defense',
			},
		},
		{
			input: new Accessor({
				mean: offPassMean,
				rank: offPassRank,
			}),
			select: {
				assume: 'team',
				edge: 'opponent',
				type: 'offense'
			},
		},
	]
);

export const defPassWins = new Processor('def-pass-win-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: defPassWin,
		range:  5,
		select: {
			assume: 'team' // make this implicit
		}
	},
]);

export const gameExpectation = new Processor('game-expectation', 
	(
		[ourOff]: {total: number, rush: number, pass: number}[], 
		[ourDef]: {total: number, rush: number, pass: number}[], 
		[theirOff]: {total: number, rush: number, pass: number}[], 
		[theirDef]: {total: number, rush: number, pass: number}[]
	) => { 
		let score = 0;
        
		// remember, ranks... lower is better
		if (ourOff.total < theirDef.total){
			score++;
		} else if (ourOff.total > theirDef.total){
			score--;
		}
		
		if (ourOff.rush < theirDef.rush){
			score++;
		} else if (ourOff.rush > theirDef.rush){
			score--;
		}
		
		if (ourOff.pass < theirDef.pass){
			score++;
		} else if (ourOff.pass > theirDef.pass){
			score--;
		}
		
		if (ourDef.total < theirOff.total){
			score++;
		} else if (ourDef.total > theirOff.total){
			score--;
		}
		
		if (ourDef.rush < theirOff.rush){
			score++;
		} else if (ourDef.rush > theirOff.rush){
			score--;
		}
		
		if (ourDef.pass < theirOff.pass){
			score++;
		} else if (ourDef.pass > theirOff.pass){
			score--;
		}
		
		if (score > 2){
			return 1;
		} else if (score < -2){
			return -1;
		} else {
			return 0;
		}
	}, [
		{
			input: new Accessor({
				total: offRank,
				rush: offRushRank,
				pass: offPassRank
			}),
			select: {
				type: 'offense',
			},
		},
		{
			input: new Accessor({
				total: defRank,
				rush: defRushRank,
				pass: defPassRank
			}),
			select: {
				type: 'defense',
			},
		},
		{
			input: new Accessor({
				total: offRank,
				rush: offRushRank,
				pass: offPassRank
			}),
			select: {
				edge: 'opponent',
				type: 'offense',
			},
		},
		{
			input: new Accessor({
				total: defRank,
				rush: defRushRank,
				pass: defPassRank
			}),
			select: {
				edge: 'opponent',
				type: 'defense',
			},
		},
	]
);

export const expectedWin = new Processor('team-expected-win', 
	(
		results: {win: boolean, expect: number}, 
	) => {
		if (results.win && results.expect > 0){
			return 1;
		}

		return 0;
	}, [
		{
			input: new Accessor({
				win: 'win',
				expect: gameExpectation
			}),
		}
	]
);

export const qualityWin = new Processor('team-quality-win', 
	(
		results: {win: boolean, expect: number}, 
	) => {
		if (results.win && results.expect < 0){
			return 1;
		}

		return 0;
	}, [
		{
			input: new Accessor({
				win: 'win',
				expect: gameExpectation
			}),
		}
	]
);

export const expectedLoss = new Processor('team-expected-loss', 
	(
		results: {win: boolean, offset: number, expect: number}, 
	) => {
		if (!results.win && results.expect < 0){
			return 1;
		}

		return 0;
	}, [
		{
			input: new Accessor({
				win: 'win',
				offset: 'offset',
				expect: gameExpectation
			}),
		}
	]
);

export const qualityLoss = new Processor('team-quality-loss', 
	(
		results: {win: boolean, offset: number, expect: number}, 
	) => {
		if (!results.win && results.expect > 0){
			return 1;
		}

		return 0;
	}, [
		{
			input: new Accessor({
				win: 'win',
				offset: 'offset',
				expect: gameExpectation
			}),
		}
	]
);

export const qualityWins = new Processor('team-quality-wins', sum, [
	{
		input: qualityWin,
		range:  5,
		select: {
			parent: 'team' // make this implicit
		}
	},
]);

export const expectedWins = new Processor('team-expected-wins', sum, [
	{
		input: expectedWin,
		range:  5,
		select: {
			parent: 'team' // make this implicit
		}
	},
]);

export const qualityLosses = new Processor('team-quality-losses', sum, [
	{
		input: qualityLoss,
		range:  5,
		select: {
			parent: 'team' // make this implicit
		}
	},
]);

export const expectedLosses = new Processor('team-expected-losses', sum, [
	{
		input: expectedLoss,
		range:  5,
		select: {
			parent: 'team' // make this implicit
		}
	},
]);

export const defPassSucceed = new Processor(
	'def-pass-succeed', 
	(
		[offenseAllowed]: number[],
		[offenseUsual]: number[]
	) => {
		return offenseAllowed < offenseUsual;
	}, [
	{
		input: offPass,
		select: {
			edge: 'opponent',
			type: 'offense',
		},
	},
	{
		input: offPassMean,
		select: {
			edge: 'opponent',
			type: 'offense',
		},
	}
]);

export const defPassSuccesses = new Processor(
	'def-pass-successes', sum, [
	{
		input: defPassSucceed,
		range:  5,
		select: {
			parent: 'team' // make this implicit
		}
	},
]);

export const defRushSucceed = new Processor(
	'def-rush-succeed', 
	(
		[offenseAllowed]: number[],
		[offenseUsual]: number[]
	) => {
		return offenseAllowed < offenseUsual;
	}, [
	{
		input: offRush,
		select: {
			assume: 'offense',
			edge: 'opponent'
		},
	},
	{
		input: offRushMean,
		select: {
			assume: 'offense',
			edge: 'opponent',
		},
	}
]);

export const defRushSuccesses = new Processor(
	'def-rush-successes', sum, [
	{
		input: defRushSucceed,
		range:  5,
		select: {
			assume: 'team' // make this implicit
		}
	},
]);

export const offPassSucceed = new Processor(
	'off-pass-succeed', 
	(
		[offenseAllowed]: number[],
		[offenseUsual]: number[]
	) => {
		return offenseAllowed < offenseUsual;
	}, [
	{
		input: offPass,
		select: {
			assume: 'offense',
		},
	},
	{
		input: offPassMean,
		select: {
			assume: 'offense',
		},
	}
]);

export const offPassSuccesses = new Processor(
	'off-pass-successes', sum, [
	{
		input: offPassSucceed,
		range:  5,
		select: {
			assume: 'team' // make this implicit
		}
	},
]);

export const offRushSucceed = new Processor(
	'off-rush-succeed', 
	(
		[offenseAllowed]: number[],
		[offenseUsual]: number[]
	) => {
		return offenseAllowed < offenseUsual;
	}, [
	{
		input: offRush,
		select: {
			assume: 'offense',
		},
	},
	{
		input: offRushMean,
		select: {
			assume: 'offense',
		},
	}
]);

export const offRushSuccesses = new Processor(
	'off-rush-successes', sum, [
	{
		input: offRushSucceed,
		range:  5,
		select: {
			assume: 'team' // make this implicit
		}
	},
]);

export const defPassSuccessRank = new Ranker(
	'def-pass-success-rank', 
	{
		asc: false, // higher is better
		bucketsCount: 6,
		select: {
			global: true,
			type: 'team'
		}
	},
	(def: number[]) => def[0],
	[
		{ input: defPassSuccesses, select: {type: 'team'} }
	]
);

export const defRushSuccessRank = new Ranker(
	'def-rush-success-rank', 
	{
		asc: false, // higher is better
		bucketsCount: 6,
		select: {
			global: true,
			type: 'team'
		}
	},
	(def: number[]) => def[0],
	[
		{ input: defRushSuccesses, select: {type: 'team'} }
	]
);

export const offRushSuccessRank = new Ranker(
	'off-rush-success-rank', 
	{
		asc: false, // higher is better
		bucketsCount: 6,
		select: {
			global: true,
			type: 'team'
		}
	},
	(def: number[]) => def[0],
	[
		{ input: offRushSuccesses, select: {type: 'team'} }
	]
);

export const offPassSuccessRank = new Ranker(
	'off-pass-success-rank', 
	{
		asc: false, // higher is better
		bucketsCount: 6,
		select: {
			global: true,
			type: 'team'
		}
	},
	(def: number[]) => def[0],
	[
		{ input: offPassSuccesses, select: {type: 'team'} }
	]
);

/*
graph.calculateNodeWeight('schedule-strength', (edgeA) => {
    return edgeA.to.getWeight('quality-rank');
}).sort('schedule-strength-rank', 'schedule-strength');

graph.calculateNodeWeight('schedule-weighted', (edgeA, edgeB) => {
    const ours = edgeA.getWeight('score');
    const theirs = edgeB.getWeight('score');
    const diff = edgeB.to.getWeight('quality-rank') -
        edgeA.to.getWeight('quality-rank');

    if (ours > theirs){
        // teamA won
        return Math.abs(diff);
    } else {
        // teamB won
        return -Math.abs(diff);
    }
}).sort('schedule-weighted-rank', 'schedule-weighted');

const dir = path.join(__dirname, `../../data/stats`);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

fs.writeFileSync(
    path.join(__dirname, `../../data/stats/${year}.json`),
    dump(graph)
);

console.log('===>', year);
console.log(
    JSON.stringify(graph.getFeatures(), null, '\t')
);
*/

/***
 * Examples
const opposingRushing = new Processor(
	'allowed-rushing',
	(value: number) => value,
	[
		{
			input: totalRushing,
			select: {
				parent: 'team',
				edge: 'opponent',
			},
			reduce: true,
		},
	],
);

const opposingRushAcross = new Processor('opposing-rushing-5', mean, [
	{
		input: opposingRushing,
		range: 5,
	},
]);

const ranker = new Ranker(
	'rushing-rank',
	{
		select: {
			parent: 'root',
			type: 'team',
		},
	},
	(value: number) => value,
	[
		{
			input: opposingRushAcross,
		},
	],
);
**/
