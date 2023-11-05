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
	rush_scrambles: number;
	rush_att: number;
	rush_yds: number;
	rush_td: number;
	rush_long: number;
	rush_yds_before_contact: number;
	rush_yac: number;
	rush_broken_tackles: number;
	targets: number;
	rec: number;
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

const totalRushing = new Processor('total-rushing', sum, [
	{
		input: new Accessor({
			value: 'rush_yds',
		}),
		select: {
			type: 'player',
		},
	},
]);

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
