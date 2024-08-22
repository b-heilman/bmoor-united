import * as fs from 'fs';
import * as path from 'path';

import {mean as calcMean, sum as calcSum, reduce} from '@bmoor/compute';
import {Context} from '@bmoor/context';
import {
	DimensionalDatumOffset as Accessor,
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

function buildTeamCalcs(
	baseLabel: string,
	field: string
){
	const off = new Processor('off-'+baseLabel, calcSum, [
		{
			input: new Accessor({
				value: field,
			}),
			select: {
				assume: 'team',
				type: 'player',
			},
		},
	]);

	const offLast = new Processor(
		'off-'+baseLabel+'-last',
		(d: number) => d,
		[
			{
				offset: -1,
				input: off,
			},
		],
	);

	const def = new Processor('def-'+baseLabel, (v) => v[0], [
		{
			input: off,
			select: {
				assume: 'defense',
				edge: 'against',
			},
		},
	]);

	const defLast = new Processor(
		'def-'+baseLabel+'-last',
		(d: number) => d,
		[
			{
				offset: -1,
				input: def,
			},
		],
	);

	return {
		off,
		offLast,
		def,
		defLast
	};
}

function buildTeamStats(
	baseLabel: string, 
	input: Processor,
	range: number = 5, 
	bucketsCount: number = 6
){	
	const mean = new Processor(baseLabel+'-mean', calcMean, [
		{
			input,
			range,
		},
	]);

	const rank = new Ranker(
		baseLabel+'-rank',
		{
			bucketsCount,
			select: {
				global: true,
				type: 'team',
			},
		},
		(input: number) => input,
		[{input: mean}],
	);

	return {
		mean,
		rank
	};
}

function buildBeatCalc(
	baseLabel: string, 
	ours: Processor, 
	theirs: Processor, 
){
	const calc = new Processor(
		baseLabel,
		(
			[ours]: {value: number;}[],
			[theirs]: {value}[],
		) => {
			return ours.value - theirs.value;
		},
		[
			{
				input: new Accessor({
					value: ours
				}),
				select: {
					assume: 'team'
				},
			},
			{
				input: new Accessor({
					value: theirs
				}),
				select: {
					assume: 'team',
					edge: 'opponent'
				},
			},
		],
	);

	const last = new Processor(
		baseLabel+'-last',
		(d: number) => d,
		[
			{
				offset: -1,
				input: calc,
			},
		],
	);

	return {
		calc,
		last
	};
}

export const {
	off: offPass, 
	offLast: offPassLast, 
	def: defPass, 
	defLast: defPassLast
} = buildTeamCalcs('pass', 'passYds');

export const {
	off: offRush, 
	offLast: offRushLast, 
	def: defRush, 
	defLast: defRushLast
} = buildTeamCalcs('rush', 'rushYds');

export const {
	mean: offPassMean5, 
	rank: offPassRank5
} = buildTeamStats('off-pass-5', offPass, 5);

export const {
	mean: offRushMean5, 
	rank: offRushRank5
} = buildTeamStats('off-rush-5', offRush, 5);

export const {
	mean: offPassMean3, 
	rank: offPassRank3
} = buildTeamStats('off-pass-3', offPass, 3);

export const {
	mean: offRushMean3, 
	rank: offRushRank3
} = buildTeamStats('off-rush-3', offRush, 3);

export const {
	mean: offPassMean2, 
	rank: offPassRank2
} = buildTeamStats('off-pass-2', offPass, 2);

export const {
	mean: offRushMean2, 
	rank: offRushRank2
} = buildTeamStats('off-rush-2', offRush, 2);

export const {
	mean: defPassMean5, 
	rank: defPassRank5
} = buildTeamStats('def-pass-5', defPass, 5);

export const {
	mean: defRushMean5, 
	rank: defRushRank5
} = buildTeamStats('def-rush-5', defRush, 5);

export const {
	mean: defPassMean3, 
	rank: defPassRank3
} = buildTeamStats('def-pass-3', defPass, 3);

export const {
	mean: defRushMean3, 
	rank: defRushRank3
} = buildTeamStats('def-rush-3', defRush, 3);

export const {
	mean: defPassMean2, 
	rank: defPassRank2
} = buildTeamStats('def-pass-2', defPass, 2);

export const {
	mean: defRushMean2, 
	rank: defRushRank2
} = buildTeamStats('def-rush-2', defRush, 2);

export const {
	calc: offPassBeat5, 
	last: offPassBeatLast5, 
} = buildBeatCalc('off-pass-beat-5', offPass, defPassMean5);

export const {
	calc: offRushBeat5, 
	last: offRushBeatLast5,
} = buildBeatCalc('off-rush-beat-5', offRush, defRushMean5);

export const {
	calc: offPassBeat3, 
	last: offPassBeatLast3, 
} = buildBeatCalc('off-pass-beat-3', offPass, defPassMean3);

export const {
	calc: offRushBeat3,
	last: offRushBeatLast3,
} = buildBeatCalc('off-rush-beat-3', offRush, defRushMean3);

export const {
	calc: offPassBeat2, 
	last: offPassBeatLast2, 
} = buildBeatCalc('off-pass-beat-2', offPass, defPassMean2);

export const {
	calc: offRushBeat2, 
	last: offRushBeatLast2,
} = buildBeatCalc('off-rush-beat-2', offRush, defRushMean2);

export const {
	calc: defPassBeat5, 
	last: defPassBeatLast5,  
} = buildBeatCalc('def-pass-beat-5', defPass, offPassMean5);

export const {
	calc: defRushBeat5, 
	last: defRushBeatLast5,  
} = buildBeatCalc('def-rush-beat-5', defRush, offRushMean5);

export const {
	calc: defPassBeat3, 
	last: defPassBeatLast3,  
} = buildBeatCalc('def-pass-beat-3', defPass, offPassMean3);

export const {
	calc: defRushBeat3, 
	last: defRushBeatLast3,  
} = buildBeatCalc('def-rush-beat-3', defRush, offRushMean3);

export const {
	calc: defPassBeat2, 
	last: defPassBeatLast2,  
} = buildBeatCalc('def-pass-beat-2', defPass, offPassMean2);

export const {
	calc: defRushBeat2,
	last: defRushBeatLast2,  
} = buildBeatCalc('def-rush-beat-2', defRush, offRushMean2);

export const {
	mean: offPassBeatMean5, 
	rank: offPassBeatRank5
} = buildTeamStats('off-pass-beat-5', offRushBeat5, 5);

export const {
	mean: offPassBeatMean3, 
	rank: offPassBeatRank3
} = buildTeamStats('off-pass-beat-3', offRushBeat5, 3);

export const {
	mean: offPassBeatMean2, 
	rank: offPassBeatRank2
} = buildTeamStats('off-pass-beat-2', offRushBeat2, 2);

export const {
	mean: offRushBeatMean5, 
	rank: offRushBeatRank5
} = buildTeamStats('off-rush-beat-5', offRushBeat5, 5);

export const {
	mean: offRushBeatMean3, 
	rank: offRushBeatRank3
} = buildTeamStats('off-rush-beat-3', offRushBeat5, 3);

export const {
	mean: offRushBeatMean2, 
	rank: offRushBeatRank2
} = buildTeamStats('off-rush-beat-2', offRushBeat2, 2);

export const {
	mean: defPassBeatMean5, 
	rank: defPassBeatRank5
} = buildTeamStats('def-pass-beat-5', defRushBeat5, 5);

export const {
	mean: defPassBeatMean3, 
	rank: defPassBeatRank3
} = buildTeamStats('def-pass-beat-3', defRushBeat5, 3);

export const {
	mean: defPassBeatMean2, 
	rank: defPassBeatRank2
} = buildTeamStats('def-pass-beat-2', defRushBeat2, 2);

export const {
	mean: defRushBeatMean5, 
	rank: defRushBeatRank5
} = buildTeamStats('def-rush-beat-5', defRushBeat5, 5);

export const {
	mean: defRushBeatMean3, 
	rank: defRushBeatRank3
} = buildTeamStats('def-rush-beat-3', defRushBeat5, 3);

export const {
	mean: defRushBeatMean2, 
	rank: defRushBeatRank2
} = buildTeamStats('def-rush-beat-2', defRushBeat2, 2);

export const wins = new Processor('team-wins', reduce((agg, cur) => cur ? agg+1 : agg), [
	{
		input: new Accessor({
			value: 'win',
		}),
		offset: -1,
		range: 5,
		select: {
			assume: 'team'
		},
	},
]);

export const losses = new Processor('team-losses', reduce((agg, cur) => !cur ? agg+1 : agg), [
	{
		input: new Accessor({
			value: 'win',
		}),
		offset: -1,
		range: 5,
		select: {
			assume: 'team'
		},
	},
]);

/**** 
 * Old calculations from first pass, might want to reuse
 * 
 * 
export const offRushWin = new Processor(
	'off-rush-win',
	(
		[our]: {yards: number; rank: number}[],
		[their]: {mean: number; rank: number}[],
	) => {
		if (our.rank < their.rank) {
			return our.yards > their.mean ? 2 : -1;
		} else if (our.rank > their.rank) {
			return our.yards > their.mean ? 1 : -2;
		} else {
			return our.yards > their.mean ? 1 : 0;
		}

		return 0;
	},
	[
		{
			input: new Accessor({
				yards: offRush,
				rank: offRushRank,
			}),
			select: {
				assume: 'team',
				type: 'offense',
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
				type: 'defense',
			},
		},
	],
);

export const offRushWins = new Processor('off-rush-win-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: offRushWin,
		range: 5,
		select: {
			assume: 'team', // make this implicit
		},
	},
]);

export const offPassWin = new Processor(
	'off-pass-win',
	(
		[our]: {yards: number; rank: number}[],
		[their]: {mean: number; rank: number}[],
	) => {
		if (our.rank < their.rank) {
			return our.yards > their.mean ? 2 : -1;
		} else if (our.rank > their.rank) {
			return our.yards > their.mean ? 1 : -2;
		} else {
			return our.yards > their.mean ? 1 : 0;
		}

		return 0;
	},
	[
		{
			input: new Accessor({
				yards: offPass,
				rank: offPassRank,
			}),
			select: {
				assume: 'team',
				type: 'offense',
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
				type: 'defense',
			},
		},
	],
);

export const offPassWins = new Processor('off-pass-win-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: offPassWin,
		range: 5,
		select: {
			assume: 'team', // make this implicit
		},
	},
]);

export const defRushWin = new Processor(
	'def-rush-win',
	(
		[our]: {yards: number; rank: number}[],
		[their]: {mean: number; rank: number}[],
	) => {
		if (our.rank < their.rank) {
			return our.yards < their.mean ? 2 : -1;
		} else if (our.rank > their.rank) {
			return our.yards < their.mean ? 1 : -2;
		} else {
			return our.yards < their.mean ? 1 : 0;
		}

		return 0;
	},
	[
		{
			input: new Accessor({
				yards: defRush,
				rank: defRushRank,
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
				type: 'offense',
			},
		},
	],
);

export const defRushWins = new Processor('def-rush-win-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: defRushWin,
		range: 5,
		select: {
			assume: 'team', // make this implicit
		},
	},
]);

export const defPassWin = new Processor(
	'def-pass-win',
	(
		[our]: {yards: number; rank: number}[],
		[their]: {mean: number; rank: number}[],
	) => {
		if (our.rank < their.rank) {
			return our.yards < their.mean ? 2 : -1;
		} else if (our.rank > their.rank) {
			return our.yards < their.mean ? 1 : -2;
		} else {
			return our.yards < their.mean ? 1 : 0;
		}

		return 0;
	},
	[
		{
			input: new Accessor({
				yards: defPass,
				rank: defPassRank,
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
				type: 'offense',
			},
		},
	],
);

export const defPassWins = new Processor('def-pass-win-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: defPassWin,
		range: 5,
		select: {
			assume: 'team', // make this implicit
		},
	},
]);

export const gameExpectation = new Processor(
	'game-expectation',
	(
		[ourOff]: {total: number; rush: number; pass: number}[],
		[ourDef]: {total: number; rush: number; pass: number}[],
		[theirOff]: {total: number; rush: number; pass: number}[],
		[theirDef]: {total: number; rush: number; pass: number}[],
	) => {
		let score = 0;

		// remember, ranks... lower is better
		if (ourOff.total < theirDef.total) {
			score++;
		} else if (ourOff.total > theirDef.total) {
			score--;
		}

		if (ourOff.rush < theirDef.rush) {
			score++;
		} else if (ourOff.rush > theirDef.rush) {
			score--;
		}

		if (ourOff.pass < theirDef.pass) {
			score++;
		} else if (ourOff.pass > theirDef.pass) {
			score--;
		}

		if (ourDef.total < theirOff.total) {
			score++;
		} else if (ourDef.total > theirOff.total) {
			score--;
		}

		if (ourDef.rush < theirOff.rush) {
			score++;
		} else if (ourDef.rush > theirOff.rush) {
			score--;
		}

		if (ourDef.pass < theirOff.pass) {
			score++;
		} else if (ourDef.pass > theirOff.pass) {
			score--;
		}

		if (score > 2) {
			return 1;
		} else if (score < -2) {
			return -1;
		} else {
			return 0;
		}
	},
	[
		{
			input: new Accessor({
				total: offRank,
				rush: offRushRank,
				pass: offPassRank,
			}),
			select: {
				type: 'offense',
			},
		},
		{
			input: new Accessor({
				total: defRank,
				rush: defRushRank,
				pass: defPassRank,
			}),
			select: {
				type: 'defense',
			},
		},
		{
			input: new Accessor({
				total: offRank,
				rush: offRushRank,
				pass: offPassRank,
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
				pass: defPassRank,
			}),
			select: {
				edge: 'opponent',
				type: 'defense',
			},
		},
	],
);

export const expectedWin = new Processor(
	'team-expected-win',
	(results: {win: boolean; expect: number}) => {
		if (results.win && results.expect > 0) {
			return 1;
		}

		return 0;
	},
	[
		{
			input: new Accessor({
				win: 'win',
				expect: gameExpectation,
			}),
		},
	],
);

export const qualityWin = new Processor(
	'team-quality-win',
	(results: {win: boolean; expect: number}) => {
		if (results.win && results.expect < 0) {
			return 1;
		}

		return 0;
	},
	[
		{
			input: new Accessor({
				win: 'win',
				expect: gameExpectation,
			}),
		},
	],
);

export const expectedLoss = new Processor(
	'team-expected-loss',
	(results: {win: boolean; offset: number; expect: number}) => {
		if (!results.win && results.expect < 0) {
			return 1;
		}

		return 0;
	},
	[
		{
			input: new Accessor({
				win: 'win',
				offset: 'offset',
				expect: gameExpectation,
			}),
		},
	],
);

export const qualityLoss = new Processor(
	'team-quality-loss',
	(results: {win: boolean; offset: number; expect: number}) => {
		if (!results.win && results.expect > 0) {
			return 1;
		}

		return 0;
	},
	[
		{
			input: new Accessor({
				win: 'win',
				offset: 'offset',
				expect: gameExpectation,
			}),
		},
	],
);

export const qualityWins = new Processor('team-quality-wins', sum, [
	{
		input: qualityWin,
		range: 5,
		select: {
			parent: 'team', // make this implicit
		},
	},
]);

export const expectedWins = new Processor('team-expected-wins', sum, [
	{
		input: expectedWin,
		range: 5,
		select: {
			parent: 'team', // make this implicit
		},
	},
]);

export const qualityLosses = new Processor('team-quality-losses', sum, [
	{
		input: qualityLoss,
		range: 5,
		select: {
			parent: 'team', // make this implicit
		},
	},
]);

export const expectedLosses = new Processor('team-expected-losses', sum, [
	{
		input: expectedLoss,
		range: 5,
		select: {
			parent: 'team', // make this implicit
		},
	},
]);

export const defPassSucceed = new Processor(
	'def-pass-succeed',
	([offenseAllowed]: number[], [offenseUsual]: number[]) => {
		return offenseAllowed < offenseUsual;
	},
	[
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
		},
	],
);

export const defPassSuccesses = new Processor('def-pass-successes', sum, [
	{
		input: defPassSucceed,
		range: 5,
		select: {
			parent: 'team', // make this implicit
		},
	},
]);

export const defRushSucceed = new Processor(
	'def-rush-succeed',
	([offenseAllowed]: number[], [offenseUsual]: number[]) => {
		return offenseAllowed < offenseUsual;
	},
	[
		{
			input: offRush,
			select: {
				assume: 'offense',
				edge: 'opponent',
			},
		},
		{
			input: offRushMean,
			select: {
				assume: 'offense',
				edge: 'opponent',
			},
		},
	],
);

export const defRushSuccesses = new Processor('def-rush-successes', sum, [
	{
		input: defRushSucceed,
		range: 5,
		select: {
			assume: 'team', // make this implicit
		},
	},
]);

export const offPassSucceed = new Processor(
	'off-pass-succeed',
	([offenseAllowed]: number[], [offenseUsual]: number[]) => {
		return offenseAllowed < offenseUsual;
	},
	[
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
		},
	],
);

export const offPassSuccesses = new Processor('off-pass-successes', sum, [
	{
		input: offPassSucceed,
		range: 5,
		select: {
			assume: 'team', // make this implicit
		},
	},
]);

export const offRushSucceed = new Processor(
	'off-rush-succeed',
	([offenseAllowed]: number[], [offenseUsual]: number[]) => {
		return offenseAllowed < offenseUsual;
	},
	[
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
		},
	],
);

export const offRushSuccesses = new Processor('off-rush-successes', sum, [
	{
		input: offRushSucceed,
		range: 5,
		select: {
			assume: 'team', // make this implicit
		},
	},
]);

export const defPassSuccessRank = new Ranker(
	'def-pass-success-rank',
	{
		asc: false, // higher is better
		bucketsCount: 6,
		select: {
			global: true,
			type: 'team',
		},
	},
	(def: number[]) => def[0],
	[{input: defPassSuccesses, select: {type: 'team'}}],
);

export const defRushSuccessRank = new Ranker(
	'def-rush-success-rank',
	{
		asc: false, // higher is better
		bucketsCount: 6,
		select: {
			global: true,
			type: 'team',
		},
	},
	(def: number[]) => def[0],
	[{input: defRushSuccesses, select: {type: 'team'}}],
);

export const offRushSuccessRank = new Ranker(
	'off-rush-success-rank',
	{
		asc: false, // higher is better
		bucketsCount: 6,
		select: {
			global: true,
			type: 'team',
		},
	},
	(def: number[]) => def[0],
	[{input: offRushSuccesses, select: {type: 'team'}}],
);

export const offPassSuccessRank = new Ranker(
	'off-pass-success-rank',
	{
		asc: false, // higher is better
		bucketsCount: 6,
		select: {
			global: true,
			type: 'team',
		},
	},
	(def: number[]) => def[0],
	[{input: offPassSuccesses, select: {type: 'team'}}],
);
********/

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
