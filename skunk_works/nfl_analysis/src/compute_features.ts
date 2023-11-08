import { Context } from '@bmoor/context';
import {executor, defPassMean, offPassMean} from './features';

// TODO: need to deal with bye weeks
const ctx1 = new Context({});
executor.calculate(
    executor.env.getInterval('2022-09'), 
    defPassMean, 
    {reference: 'PHI'}, 
    ctx1
).then(res => {
    console.log(
        'Philly defense', 
        res
    );
}).finally(() => {
    ctx1.close();
})

const ctx2 = new Context({});
executor.calculate(
    executor.env.getInterval('2022-09'), 
    offPassMean, 
    {reference: 'PHI'},
    ctx2
).then(res => {
    console.log(
        'Philly offense', 
        res
    );
}).finally(() => {
    ctx2.close();
});