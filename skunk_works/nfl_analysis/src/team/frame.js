const fs = require('fs');
const path = require('path');

const {load} = require('@bmoor/graph');
const {Frame} = require('@bmoor/graph');

const seasons = ['2019', '2020', '2021', '2022'];

for(const year of seasons){
    const frame = new Frame(
        load(
            fs.readFileSync(
                path.join(__dirname, `../../data/stats/${year}.json`)
            )
        )
    );

    frame.compute(
        (nodeA, nodeB, edgeA, edgeB) => {
            return Object.assign(
                nodeA.compareFeatures(nodeB, [
                    'def-rank',
                    'off-rank',
                    'full-rank',
                    'schedule-strength-rank',
                    'schedule-weighted-rank'
                ]),
                {
                    'pass-off-v-def': nodeA.getWeight('off-pass-rank') - 
                        nodeB.getWeight('def-pass-rank'),
                    'rush-off-v-def': nodeA.getWeight('off-rush-rank') - 
                        nodeB.getWeight('def-rush-rank'),
                    'pass-def-v-off': nodeA.getWeight('def-pass-rank') - 
                        nodeB.getWeight('off-pass-rank'),
                    'rush-def-v-off': nodeA.getWeight('def-rush-rank') - 
                        nodeB.getWeight('off-rush-rank')
                }
            );
        }, {
            labeler: (edgeA, edgeB) => {
                return {
                    label: edgeA.getWeight('score') - edgeB.getWeight('score')
                };
            }
        }
    );

    console.log('--correlations--', year);
    frame.getColumnCombinations().map(([left, right]) => {
        return {
            label: left+' --v-- '+right,
            correlation: frame.checkCorrelation(left, right)
        };
    }).sort((a, b) => b.correlation - a.correlation)
    .forEach(row => {
        console.log(row.correlation.toFixed(5), row.label);
    });

    const dir = path.join(__dirname, `../../data/frames`);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    fs.writeFileSync(
        path.join(__dirname, `../../data/frames/${year}.json`),
        JSON.stringify(frame, null, '\t')
    );
}