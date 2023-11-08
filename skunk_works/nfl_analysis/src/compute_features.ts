import { Context } from '@bmoor/context';
import {executor, defPassMean, offPassMean} from './features';

const ctx1 = new Context({flags: {verbose: false}});
executor.calculate(
    executor.env.getInterval('2022-09'), 
    defPassMean, 
    {reference: 'PHI', type:'defense'}, 
    ctx1
).then(res => {
    console.log(
        'Philly defense', 
        res
    );
}).finally(() => {
    ctx1.close();
})


const ctx2 = new Context({flags: {verbose: false}});
executor.calculate(
    executor.env.getInterval('2022-09'), 
    offPassMean, 
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