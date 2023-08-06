const fs = require('fs');
const path = require('path');

const {prettyArray} = require('@bmoor/string');
const {load} = require('@bmoor/graph');

const seasons = ['2019', '2020', '2021', '2022'];

for(const year of seasons){
    const graph = load(
        fs.readFileSync(
            path.join(__dirname, `../../data/stats/${year}.json`)
        )
    );

    console.log('--->', year);
    console.log(prettyArray(graph.toArray('schedule-weighted-rank'), {
        header: 'ref',
        columns: {
            'features.off-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'features.def-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'features.wins': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'features.losses': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'features.quality': {
                length: 10,
                precision: 2,
                align: 'right'
            },
            'features.quality-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'features.schedule-strength-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'features.schedule-weighted-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'features.full-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            }
        }
    }));
}