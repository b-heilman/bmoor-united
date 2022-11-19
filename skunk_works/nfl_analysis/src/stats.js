const fs = require('fs');
const path = require('path');

const {load, dump} = require('@bmoor/graph');

const seasons = ['2019', '2020', '2021', '2022'];

for(const year of seasons){
    const graph = load(
        fs.readFileSync(
            path.join(__dirname, `../seasons/${year}.json`)
        )
    );

    graph.calculateNodeWeight(
        'off-pass-mean', 
        edge => edge.weights.pass_yds,
        {
            summarizer: (values) => {
                const sum = values.reduce((agg, value) => agg+value);

                return sum / values.length;
            }
        }
    );

    graph.calculateNodeWeight(
        'off-rush-mean', 
        edge => edge.weights.rush_yds,
        {
            summarizer: (values) => {
                const sum = values.reduce((agg, value) => agg+value);

                return sum / values.length;
            }
        }
    );

    graph.calculateNodeWeight(
        'def-pass-mean', 
        (edgeA, edgeB) => edgeB.weights.pass_yds,
        {
            summarizer: (values) => {
                const sum = values.reduce((agg, value) => agg+value);

                return sum / values.length;
            }
        }
    );

    graph.calculateNodeWeight(
        'def-rush-mean', 
        (edgeA, edgeB) => edgeB.weights.rush_yds,
        {
            summarizer: (values) => {
                const sum = values.reduce((agg, value) => agg+value);

                return sum / values.length;
            }
        }
    );

    graph.sort(
        'off-rush-rank', 
        (nodeA, nodeB) => {
            // more yards is better
            return nodeB.weights['off-rush-mean'] - nodeA.weights['off-rush-mean'];
        }
    );

    graph.sort(
        'off-pass-rank', 
        (nodeA, nodeB) => {
            // more yards is better
            return nodeB.weights['off-pass-mean'] - nodeA.weights['off-pass-mean']
        }
    );

    const oRanked = graph.sort(
        'off-rank', 
        (nodeA, nodeB) => {
            // more yards is better
            return (nodeB.weights['off-pass-rank'] + nodeB.weights['off-rush-rank']) - 
                (nodeA.weights['off-pass-rank'] + nodeA.weights['off-rush-rank']);
        }
    );

    oRanked.bucket('off-bucket', 4);

    graph.sort(
        'def-rush-rank', 
        (nodeA, nodeB) => {
            // more yards is worse
            return nodeA.weights['def-rush-mean'] - nodeB.weights['def-rush-mean']
        }
    );

    graph.sort(
        'def-pass-rank', 
        (nodeA, nodeB) => {
            // more yards is worse
            return nodeA.weights['def-pass-mean'] - nodeB.weights['def-pass-mean']
        }
    );

    const dRanked = graph.sort(
        'def-rank', 
        (nodeA, nodeB) => {
            // higher ranks wanted
            return (nodeB.weights['def-pass-rank'] + nodeB.weights['def-rush-rank']) - 
                (nodeA.weights['def-pass-rank'] + nodeA.weights['def-rush-rank']);
        }
    );

    dRanked.bucket('def-bucket', 4);

    const ranked = graph.sort(
        'full-rank', 
        (nodeA, nodeB) => {
            // higher ranks wanted
            return (nodeB.getWeight('def-rank') + nodeB.weights['off-rank']) - 
                (nodeA.weights['def-rank'] + nodeA.weights['off-rank']);
        }
    );
    
    graph.point('wins', (edgeA, edgeB) => {
        if (edgeA.getWeight('score') > edgeB.getWeight('score')){
            return 1;
        }
    });

    graph.point('losses', (edgeA, edgeB) => {
        if (edgeA.getWeight('score') < edgeB.getWeight('score')){
            return 1;
        }
    });

    graph.point('quality', (edgeA, edgeB) => {
        const nodeA = edgeB.to;
        const nodeB = edgeA.to;
        const ours = edgeA.getWeight('score');
        const theirs = edgeB.getWeight('score');

        if (ours > theirs){
            let score = 0;
            
            if (nodeB.getWeight('def-bucket') > nodeA.getWeight('off-bucket')){
                score += 
                    (nodeB.getWeight('def-bucket') - nodeA.getWeight('off-bucket'));
            } else {
                score += .5;
            }

            if (nodeB.getWeight('off-bucket') > nodeA.getWeight('def-bucket')){
                score += 
                    (nodeB.getWeight('off-bucket') - nodeA.getWeight('def-bucket')) * .5;
            } else {
                score += .5;
            }

            return score * (ours - theirs);
        } else {
            let score = 0;

            if (nodeA.getWeight('def-bucket') > nodeB.getWeight('off-bucket')){
                score += 
                    (nodeA.getWeight('def-bucket') - nodeB.getWeight('off-bucket')) * .5;
            } else {
                score += .5;
            }

            if (nodeA.getWeight('off-bucket') > nodeB.getWeight('def-bucket')){
                score += 
                    (nodeA.getWeight('off-bucket') - nodeB.getWeight('def-bucket')) * .5;
            } else {
                score += .5;
            }

            return -score * (theirs - ours);
        }
    });

    graph.sort('quality-rank', 'quality');

    graph.calculateNodeWeight('schedule-strength', (edgeA) => {
        return edgeA.to.getWeight('quality-rank');
    }).sort('schedule-strength-rank', 'schedule-strength');

    graph.calculateNodeWeight('schedule-weighted', (edgeA, edgeB) => {
        const ours = edgeA.getWeight('score');
        const theirs = edgeB.getWeight('score');
        const diff = edgeB.to.getWeight('quality-rank') -
            edgeA.to.getWeight('quality-rank');

        if (ours > theirs){
            // teamA won
            return Math.abs(diff);
        } else {
            // teamB won
            return -Math.abs(diff);
        }
    }).sort('schedule-weighted-rank', 'schedule-weighted');

    fs.writeFileSync(
        path.join(__dirname, `../stats/${year}.json`),
        dump(graph)
    );
}