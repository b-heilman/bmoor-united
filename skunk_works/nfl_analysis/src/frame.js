const fs = require('fs');
const path = require('path');

const {load} = require('@bmoor/graph');

const seasons = ['2019', '2020', '2021', '2022'];

for(const year of seasons){
    const graph = load(
        fs.readFileSync(
            path.join(__dirname, `../seasons/${year}.json`)
        )
    );

    const json = graph.computeDataFrame(
        (edgeA, edgeB) => {
            return Object.assign(
                edgeA.compareWeights(edgeB, [
                    'def-rank',
                    'off-rank',
                    'full-rank',
                    'quality-rank',
                    'schedule-strength-rank',
                    'schedule-weighted-rank'
                ]),
                {
                    'off-v-def': edgeA.getWeight('off-rank') - 
                        edgeB.getWeight('def-rank'),
                    'def-v-off': edgeA.getWeight('def-rank') - 
                        edgeB.getWeight('off-rank'),
                }
            );
        }, {
            labeler: (edgeA, edgeB) => {
                return edgeA.getWeight('score') > edgeB.getWeight('score') ?
                    1 : 0
            },
            labelMount: 'winning'
        }
    );

    fs.writeFileSync(
        path.join(__dirname, `../frames/${year}.json`),
        JSON.stringify(json, null, '\t')
    );
}