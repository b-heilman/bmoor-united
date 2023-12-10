import * as fs from 'fs';
import * as path from 'path';

console.log('fresh', process.memoryUsage());
import {graph} from './features';
import {calculateCompare} from './compute';
console.log('loaded', process.memoryUsage());

async function run(){
    const rtn = {
        keys: null,
        training: []
    };

    for (const interval of Array.from(graph.intervals.values()).slice(8, 40)){
        console.log(interval);
        console.log(process.memoryUsage());
        const weekGraph = graph.getGraph(interval);

        const proc = [];

        for (const event of weekGraph.eventDex.values()){
            const nodes = event.getNodesByType('team');

            proc.push(
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

        await Promise.all(proc).then(rows => {
            for (const row of rows){
                if (!rtn.keys){
                    rtn.keys = row.metadata.keys
                }

                rtn.training.push([row.compare, row.label]);
            }
        });
    }

    fs.writeFileSync(
        path.join(__dirname, `../data/training.json`),
        JSON.stringify(rtn, null, 2),
        {encoding: 'utf-8'}
    );

    return rtn;
}

run().then(res => console.log('--done--'));




