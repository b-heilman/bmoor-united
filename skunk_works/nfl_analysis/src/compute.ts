import {Context} from '@bmoor/context';
import {NodeValueSelector} from '@bmoor/graph';
import {DimensionalDatumAccessor as Accessor} from '@bmoor/graph-compute';

import {
	defPassMean,
	defPassSuccessRank,
	defPassSuccesses,
	defPassWins,
	defRushMean,
	defRushSuccessRank,
	defRushSuccesses,
	defRushWins,
	executor,
	expectedLosses,
	expectedWins,
	offPassMean,
	offPassSuccessRank,
	offPassSuccesses,
	offPassWins,
	offRushMean,
	offRushSuccessRank,
	offRushSuccesses,
	offRushWins,
	qualityLosses,
	qualityWins,
} from './features';

export const offenseProperties = {
	offPassMean,
	offRushMean,
	offPassWins,
	offRushWins,
	offPassSuccesses,
	offRushSuccesses,
	offPassSuccessRank,
	offRushSuccessRank,
};

export const defenseProperties = {
	defPassMean,
	defRushMean,
	defPassWins,
	defRushWins,
	defPassSuccesses,
	defRushSuccesses,
	defPassSuccessRank,
	defRushSuccessRank,
};

export const teamProperties = {
	qualityWins,
	expectedWins,
	qualityLosses,
	expectedLosses,
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

export async function calculateCompare(interval, team1, team2) {
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
