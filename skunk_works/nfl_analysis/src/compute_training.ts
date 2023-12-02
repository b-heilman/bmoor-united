import * as fs from 'fs';
import * as path from 'path';

import {graph} from './features';
import {calculateCompare} from './compute_features';

async function run(){
    const rtn = [];

    for (const interval of graph.intervals.values()){
        const weekGraph = graph.getGraph(interval);

        for (const event of weekGraph.eventDex.values()){
            const nodes = event.getNodesByType('team');
            
            rtn.push(await calculateCompare(interval.ref, nodes[0].ref, nodes[1].ref));
        }
    }

    fs.writeFileSync(
        path.join(__dirname, `../data/training.json`),
        JSON.stringify(rtn, null, 2),
        {encoding: 'utf-8'}
    );

    return rtn;
}

run().then(res => console.log('--done--'));




