const fs = require('fs');
const path = require('path');

const {load} = require('@bmoor/graph');

const seasons = ['2019', '2020', '2021', '2022'];

for(const year of seasons){
    const graph = load(
        fs.readFileSync(
            path.join(__dirname, `../../data/stats/${year}.json`)
        )
    );

    const json = graph.computeDataFrame(
        (nodeA, nodeB, edgeA, edgeB) => {
            return Object.assign(
                nodeA.compareWeights(nodeB, [
                    'def-rank',
                    'off-rank',
                    'full-rank',
                    'quality-rank',
                    'schedule-strength-rank',
                    'schedule-weighted-rank'
                ]),
                {
                    'off-v-def': nodeA.getWeight('off-rank') - 
                        nodeB.getWeight('def-rank'),
                    'pass-off-v-def': nodeA.getWeight('off-pass-rank') - 
                        nodeB.getWeight('def-pass-rank'),
                    'rush-off-v-def': nodeA.getWeight('off-rush-rank') - 
                        nodeB.getWeight('def-rush-rank'),
                    'def-v-off': nodeA.getWeight('def-rank') - 
                        nodeB.getWeight('off-rank'),
                    'pass-def-v-off': nodeA.getWeight('def-pass-rank') - 
                        nodeB.getWeight('off-pass-rank'),
                    'rush-def-v-off': nodeA.getWeight('def-rush-rank') - 
                        nodeB.getWeight('off-rush-rank')
                }
            );
        }, {
            labeler: (edgeA, edgeB) => {
                return edgeA.getWeight('score') - edgeB.getWeight('score')
            },
            labelMount: 'winning'
        }
    );

    const dir = path.join(__dirname, `../data/frames`);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    fs.writeFileSync(
        path.join(__dirname, `../data/frames/${year}.json`),
        JSON.stringify(json, null, '\t')
    );
}