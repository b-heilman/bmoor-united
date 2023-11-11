import { Context } from '@bmoor/context';
import {executor, defRank, offRank, teamRank} from './features';
/*
const ctx1 = new Context({flags: {verbose: false}});
executor.calculate(
    executor.env.getInterval('2022-09'), 
    defRank, 
    {reference: 'PHI', type:'defense'}, 
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
const ctx3 = new Context({flags: {verbose: true}});
executor.calculate(
    executor.env.getInterval('2022-09'), 
    teamRank, 
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