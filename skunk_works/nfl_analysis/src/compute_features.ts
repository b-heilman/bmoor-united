import { Context } from '@bmoor/context';
import {
	DimensionalDatumAccessor as Accessor
} from '@bmoor/graph-compute';
import {
    offPass,
    offPassMean,
    defPass,
    defPassMean,
    executor, 
    qualityWins, 
    expectedWins, 
    qualityLosses, 
    expectedLosses,
    defPassSucceed,
    defRushSucceed,
    offPassSucceed,
    offRushSucceed,
    defPassSuccesses,
    defRushSuccesses,
    offPassSuccesses,
    offRushSuccesses,
    defPassSuccessRank,
    defRushSuccessRank,
    offPassSuccessRank,
    offRushSuccessRank,
} from './features';
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
const ctx3 = new Context({flags: {verbose: true/*, reference: 'PHI'*/}});
executor.calculate(
    executor.env.getInterval('2023-10'), 
    // all of these are calculated as of after this week's game since I removed offsets
    new Accessor({
        offPass,
        offPassMean,
        defPass,
        defPassMean,
        /*
        defPassSuccessRank,
        defRushSuccessRank,
        offPassSuccessRank,
        offRushSuccessRank,
        */
    }), 
    {reference: 'PHI'},
    ctx3
).then(res => {
    console.log(
        'Philly', 
        res
    );
}).finally(() => {
    ctx3.close();
});
