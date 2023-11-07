import {executor, defPassMean, offPassMean} from './features';

// TODO: when a select fails, dump out the content around the failed select
executor.calculate(executor.env.getInterval('2022-09'), defPassMean, {reference: 'PHI'})
.then(res => {
    console.log(
        'Philly defense', 
        res
    );
});


executor.calculate(executor.env.getInterval('2022-09'), offPassMean, {reference: 'PHI'})
.then(res => {
    console.log(
        'Philly offense', 
        res
    );
});