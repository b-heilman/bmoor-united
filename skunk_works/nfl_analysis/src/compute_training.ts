import * as fs from 'fs';
import * as path from 'path';

import {graph} from './features';
import {calculateCompare} from './compute';

async function run(){
    const rtn = [];

    for (const interval of graph.intervals.values()){
        const weekGraph = graph.getGraph(interval);

        for (const event of weekGraph.eventDex.values()){
            const nodes = event.getNodesByType('team');

            rtn.push(
                calculateCompare(interval.ref, nodes[0].ref, nodes[1].ref)
                .then((res: Record<string, number>[]) => {
                    const keys = Object.keys(res[0]).slice(2);
                    const compare = [];
                
                    for (const row of res){
                        const values = [];
                        for (const key of keys){
                            values.push(row[key]);
                        }
                
                        compare.push(values);
                    }
                
                    return {
                        metadata: {
                            keys
                        },
                        compare,
                        label: res[0].score > res[1].score
                    };
                })
            );
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




