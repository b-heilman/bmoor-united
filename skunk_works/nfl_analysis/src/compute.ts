import {Context} from '@bmoor/context';
import {NodeValueSelector, GraphView} from '@bmoor/graph';
import {DimensionalDatumOffset as Accessor, GraphCompute, Interval} from '@bmoor/graph-compute';

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
	losses,
    'direct': function(ctx, state: Record<string, any>, view: GraphView, fromTeam: string, toTeam: string){
        const paths = view.getAllPaths(fromTeam, toTeam, 5);
		const dex = paths.reduce(
            (agg, path) => {
                agg[path.length].push(path);

                return agg;
            }, {
                '2': [],
                '3': [],
                '4': [],
                '5': []
            }
        );

		state.dex = dex;

        return view.sumEdges(
            dex['2'],
            (from, to) => <number>from.get('score') - <number>to.get('score'),
        ).reduce((agg, val) => agg + val, 0);
    },
    'offset-3': function(ctx, state, view, fromTeam, toTeam){
        return view.sumEdges(
            state.dex['3'],
            (from, to) => <number>from.get('score') - <number>to.get('score'),
        ).reduce((agg, val) => agg + val, 0);
    },
    'offset-4': function(ctx, state, view, fromTeam, toTeam){
        return view.sumEdges(
            state.dex['4'],
            (from, to) => <number>from.get('score') - <number>to.get('score'),
        ).reduce((agg, val) => agg + val, 0);
    },
    'offset-5': function(ctx, state, view, fromTeam, toTeam){
        return view.sumEdges(
            state.dex['5'],
            (from, to) => <number>from.get('score') - <number>to.get('score'),
        ).reduce((agg, val) => agg + val, 0);
    }
};

function filter(properties: object){
    const calculated = {};
    const functional = {};

    for (const key in properties){
        const value = properties[key];

        if (typeof value === 'function'){
            functional[key] = value;
        } else {
            calculated[key] = value;
        }
    }
    return {
        calculated,
        functional
    }
}

const {calculated: offsenseCalculated, functional: offenseFunctions} = filter(offenseProperties);
const {calculated: defenseCalculated, functional: defenseFunctions} = filter(defenseProperties);
const {calculated: teamCalculated, functional: teamFunctions} = filter(teamProperties);
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

export async function calculateCompare(
    view: GraphView, 
    interval: Interval, 
    team1: string, 
    team2: string
) {
	const ctx = new Context({
		flags: {verbose: false /*, reference: 'PHI'*/},
	});

	const state = {};
	const rtn = executor.calculate(
		executor.env.getInterval(interval.ref),
		// all of these are calculated as of after this week's game since I removed offsets
		new Accessor(
			Object.assign(
				{
					name: 'display',
					score: 'score',
				},
				teamCalculated,
				offsenseCalculated,
				defenseCalculated,
			),
			{
				name: NodeValueSelector.event,
				score: NodeValueSelector.event,
			},
		),
		{reference: team1, and: [{reference: team2}]},
		ctx,
	).then(rtn => {
        const [team1Res, team2Res] = rtn;

        [offenseFunctions, defenseFunctions, teamFunctions].forEach(
            functions => {
                for (const key in functions){
                    team1Res[key] = functions[key](ctx, state, view, team1, team2);
                    team2Res[key] = functions[key](ctx, state, view, team2, team1);
                }
            }
        );

        return rtn;
    });
    
	rtn.finally(() => {
		ctx.close();
	});

	return rtn;
}
