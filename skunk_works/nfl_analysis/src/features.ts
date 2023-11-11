import * as fs from 'fs';
import * as path from 'path';

import {mean, sum} from '@bmoor/compute';
import {
	DimensionalDatumAccessor as Accessor,
	DimensionalExecutor,
	DimensionalDatumProcessor as Processor,
	DimensionalDatumRanker as Ranker,
	load,
} from '@bmoor/graph-compute';

type PlayerEvent = {
	pass_cmp: number;
	pass_att: number;
	pass_yds: number;
	pass_td: number;
	pass_int: number;
	pass_sacked: number;
	pass_long: number;
	pass_rating: number;
	pass_target_yds: number;
	pass_poor_throws: number;
	pass_blitzed: number;
	pass_hurried: number;
	pass_scrambles: number;
	rush_att: number;
	rush_yds: number;
	rush_td: number;
	rush_long: number;
	rush_yds_before_contact: number;
	rush_yac: number;
	rush_broken_tackles: number;
	rec_att: number;
	rec_cmp: number;
	rec_yds: number;
	rec_td: number;
	rec_drops: number;
	rec_long: number;
	rec_air_yds: number;
	rec_yac: number;
	fumbles_lost: number;
};

type GameEvent = {
	score: number;
	win: boolean;
	offset: number;
};

const graph = load(
	JSON.parse(
		fs.readFileSync(path.join(__dirname, `../data/graph.json`), {
			encoding: 'utf-8',
		}),
	),
);

export const executor = new DimensionalExecutor(graph);

export const offPass = new Processor('off-pass', sum, [
	{
		input: new Accessor({
			value: 'pass_yds',
		}),
		select: {
			type: 'player',
		},
	},
]);

export const offPassMean = new Processor('off-pass-mean', mean, [
	{
		input: offPass,
		offset: -1,
		range: 5,
		strict: false
	},
]);

export const offRush = new Processor('off-rush', sum, [
	{
		input: new Accessor({
			value: 'rush_yds',
		}),
		select: {
			type: 'player',
		},
	},
]);

export const offRushMean = new Processor('off-rush-mean', mean, [
	{
		input: offRush,
		offset: -1,
		range:  5,
		strict: false
	},
]);

export const defRush = new Processor('def-rush', v => v[0], [
	{
		input: offRush,
		select: {
			parent: 'defense',
			edge: 'against'
		},
	}
])

export const defRushMean = new Processor('def-rush-mean', mean, [
	{
		input: defRush,
		offset: -1,
		range:  5,
		strict: false,
		select: {
			parent: 'defense' // make this implicit
		}
	},
]);

export const defPass = new Processor('def-pass', v => v[0], [
	// TODO: how do I make this always read from the defense?
	{
		input: offPass,
		select: {
			parent: 'defense', // how can I make this implicit?
			edge: 'against'
		},
	}
])

export const defPassMean = new Processor('def-pass-mean', mean, [
	// TODO: this should be on the defense, ideally...
	{
		input: defPass,
		offset: -1,
		range:  5,
		strict: false,
		select: {
			parent: 'defense' // make this implicit
		}
	},
]);

export const offRushRank = new Ranker(
	'off-rush-rank', 
	{
		buckets: 8,
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
		buckets: 8,
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
		buckets: 8,
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
		buckets: 8,
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
		buckets: 8,
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
		buckets: 8,
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
		buckets: 6,
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

/*

graph.point('wins', (edgeA, edgeB) => {
    if (edgeA.getWeight('score') > edgeB.getWeight('score')){
        return 1;
    }
});

graph.point('losses', (edgeA, edgeB) => {
    if (edgeA.getWeight('score') < edgeB.getWeight('score')){
        return 1;
    }
});

graph.point('quality', (edgeA, edgeB) => {
    const nodeA = edgeB.to;
    const nodeB = edgeA.to;
    const ours = edgeA.getWeight('score');
    const theirs = edgeB.getWeight('score');

    if (ours > theirs){
        let score = 0;
        
        if (nodeB.getWeight('def-bucket') > nodeA.getWeight('off-bucket')){
            score += 
                (nodeB.getWeight('def-bucket') - nodeA.getWeight('off-bucket'));
        } else {
            score += .5;
        }

        if (nodeB.getWeight('off-bucket') > nodeA.getWeight('def-bucket')){
            score += 
                (nodeB.getWeight('off-bucket') - nodeA.getWeight('def-bucket')) * .5;
        } else {
            score += .5;
        }

        return score * (ours - theirs);
    } else {
        let score = 0;

        if (nodeA.getWeight('def-bucket') > nodeB.getWeight('off-bucket')){
            score += 
                (nodeA.getWeight('def-bucket') - nodeB.getWeight('off-bucket')) * .5;
        } else {
            score += .5;
        }

        if (nodeA.getWeight('off-bucket') > nodeB.getWeight('def-bucket')){
            score += 
                (nodeA.getWeight('off-bucket') - nodeB.getWeight('def-bucket')) * .5;
        } else {
            score += .5;
        }

        return -score * (theirs - ours);
    }
});

graph.sort('quality-rank', 'quality');

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
