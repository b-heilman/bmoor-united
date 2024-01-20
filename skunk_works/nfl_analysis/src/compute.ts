import {Context} from '@bmoor/context';
import {NodeValueSelector, GraphView} from '@bmoor/graph';
import {DimensionalDatumAccessor as Accessor} from '@bmoor/graph-compute';

import {
	executor,
	offPassMean2,
	offPassRank2,
	offPassBeatMean2,
	offPassBeatRank2,
	offRushMean2,
	offRushRank2,
	offRushBeatMean2,
	offRushBeatRank2,
	offPassMean3,
	offPassRank3,
	offPassBeatMean3,
	offPassBeatRank3,
	offRushMean3,
	offRushRank3,
	offRushBeatMean3,
	offRushBeatRank3,
	offPassMean5,
	offPassRank5,
	offPassBeatMean5,
	offPassBeatRank5,
	offRushMean5,
	offRushRank5,
	offRushBeatMean5,
	offRushBeatRank5,
	defPassMean2,
	defPassRank2,
	defPassBeatMean2,
	defPassBeatRank2,
	defRushMean2,
	defRushRank2,
	defRushBeatMean2,
	defRushBeatRank2,
	defPassMean3,
	defPassRank3,
	defPassBeatMean3,
	defPassBeatRank3,
	defRushMean3,
	defRushRank3,
	defRushBeatMean3,
	defRushBeatRank3,
	defPassMean5,
	defPassRank5,
	defPassBeatMean5,
	defPassBeatRank5,
	defRushMean5,
	defRushRank5,
	defRushBeatMean5,
	defRushBeatRank5,
	wins,
	losses
} from './features';

export const offenseProperties = {
	offPassMean2,
	offPassRank2,
	offPassBeatMean2,
	offPassBeatRank2,
	offRushMean2,
	offRushRank2,
	offRushBeatMean2,
	offRushBeatRank2,
	offPassMean3,
	offPassRank3,
	offPassBeatMean3,
	offPassBeatRank3,
	offRushMean3,
	offRushRank3,
	offRushBeatMean3,
	offRushBeatRank3,
	offPassMean5,
	offPassRank5,
	offPassBeatMean5,
	offPassBeatRank5,
	offRushMean5,
	offRushRank5,
	offRushBeatMean5,
	offRushBeatRank5,
};

export const defenseProperties = {
	defPassMean2,
	defPassRank2,
	defPassBeatMean2,
	defPassBeatRank2,
	defRushMean2,
	defRushRank2,
	defRushBeatMean2,
	defRushBeatRank2,
	defPassMean3,
	defPassRank3,
	defPassBeatMean3,
	defPassBeatRank3,
	defRushMean3,
	defRushRank3,
	defRushBeatMean3,
	defRushBeatRank3,
	defPassMean5,
	defPassRank5,
	defPassBeatMean5,
	defPassBeatRank5,
	defRushMean5,
	defRushRank5,
	defRushBeatMean5,
	defRushBeatRank5,
};

export const teamProperties = {
	wins,
	losses
};

/*
const ctx1 = new Context({flags: {verbose: true}});
executor.calculate(
    executor.env.getInterval('2022-09'), 
    defRushMean, 
    {reference: 'PHI:def'}, 
    ctx1
).then(res => {
    console.log(
        'Philly defense', 
        res
    );
}).finally(() => {
    ctx1.close();
});

const ctx2 = new Context({flags: {verbose: false}});
executor.calculate(
    executor.env.getInterval('2022-09'), 
    offRank, 
    {reference: 'PHI', type:'offense'},
    ctx2
).then(res => {
    console.log(
        'Philly offense', 
        res
    );
}).finally(() => {
    ctx2.close();
});
*/

export async function calculateCompare(view: GraphView, interval: string, team1: string, team2: string) {
	const ctx3 = new Context({
		flags: {verbose: false /*, reference: 'PHI'*/},
	});

	const rtn = executor.calculate(
		executor.env.getInterval(interval),
		// all of these are calculated as of after this week's game since I removed offsets
		new Accessor(
			Object.assign(
				{
					name: 'display',
					score: 'score',
				},
				teamProperties,
				offenseProperties,
				defenseProperties,
			),
			{
				name: NodeValueSelector.event,
				score: NodeValueSelector.event,
			},
		),
		{reference: team1, and: [{reference: team2}]},
		ctx3,
	);

	rtn.finally(() => {
		ctx3.close();
	});

	return rtn;
}
