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
            'weights.off-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'weights.def-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'weights.wins': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'weights.losses': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'weights.quality': {
                length: 10,
                precision: 2,
                align: 'right'
            },
            'weights.quality-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'weights.schedule-strength-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'weights.schedule-weighted-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            },
            'weights.full-rank': {
                length: 10,
                precision: 0,
                align: 'right'
            }
        }
    }));
}