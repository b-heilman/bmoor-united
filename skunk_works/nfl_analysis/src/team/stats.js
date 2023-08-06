const fs = require('fs');
const path = require('path');

const {
    load, 
    dump, 
    GraphCalculator, 
    GraphSelection,
    GraphFrame
} = require('@bmoor/graph');

const graph = load(
    fs.readFileSync(
        path.join(__dirname, `../../data/graph.json`)
    )
);
const calculator =  new GraphCalculator();
const frame = new GraphFrame(graph);

console.log('intervals\n', graph.getIntervalsInOrder());

const types = graph.getNodeTypes();
for (const type of types){
    console.log('=>', type);
    console.log(JSON.stringify(
        graph.getNodeFields(type), null, 2
    ));
}

calculator.setSelection(new GraphSelection(graph, {
    type: 'player',
    tag: 'qb'
})).intervalSum('pass_yds');

console.log(
    frame.getNodeFeatures(graph.getIntervalByPos(-1), 'player').toString()
);
/*
graph.calculateNodeWeight(
    'off-pass-mean', 
    edge => edge.features.pass_yds,
    {
        summarizer: (values) => {
            const sum = values.reduce((agg, value) => agg+value);

            return sum / values.length;
        }
    }
);

graph.calculateNodeWeight(
    'off-rush-mean', 
    edge => edge.features.rush_yds,
    {
        summarizer: (values) => {
            const sum = values.reduce((agg, value) => agg+value);

            return sum / values.length;
        }
    }
);

graph.calculateNodeWeight(
    'def-pass-mean', 
    (edgeA, edgeB) => edgeB.features.pass_yds,
    {
        summarizer: (values) => {
            const sum = values.reduce((agg, value) => agg+value);

            return sum / values.length;
        }
    }
);

graph.calculateNodeWeight(
    'def-rush-mean', 
    (edgeA, edgeB) => edgeB.features.rush_yds,
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
        return nodeB.features['off-rush-mean'] - nodeA.features['off-rush-mean'];
    }
);

graph.sort(
    'off-pass-rank', 
    (nodeA, nodeB) => {
        // more yards is better
        return nodeB.features['off-pass-mean'] - nodeA.features['off-pass-mean']
    }
);

const oRanked = graph.sort(
    'off-rank', 
    (nodeA, nodeB) => {
        // more yards is better
        return (nodeB.features['off-pass-rank'] + nodeB.features['off-rush-rank']) - 
            (nodeA.features['off-pass-rank'] + nodeA.features['off-rush-rank']);
    }
);

oRanked.bucket('off-bucket', 4);

graph.sort(
    'def-rush-rank', 
    (nodeA, nodeB) => {
        // more yards is worse
        return nodeA.features['def-rush-mean'] - nodeB.features['def-rush-mean']
    }
);

graph.sort(
    'def-pass-rank', 
    (nodeA, nodeB) => {
        // more yards is worse
        return nodeA.features['def-pass-mean'] - nodeB.features['def-pass-mean']
    }
);

const dRanked = graph.sort(
    'def-rank', 
    (nodeA, nodeB) => {
        // higher ranks wanted
        return (nodeB.features['def-pass-rank'] + nodeB.features['def-rush-rank']) - 
            (nodeA.features['def-pass-rank'] + nodeA.features['def-rush-rank']);
    }
);

dRanked.bucket('def-bucket', 4);

const ranked = graph.sort(
    'full-rank', 
    (nodeA, nodeB) => {
        // higher ranks wanted
        return (nodeB.getWeight('def-rank') + nodeB.features['off-rank']) - 
            (nodeA.features['def-rank'] + nodeA.features['off-rank']);
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

const dir = path.join(__dirname, `../../data/stats`);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

fs.writeFileSync(
    path.join(__dirname, `../../data/stats/${year}.json`),
    dump(graph)
);

console.log('===>', year);
console.log(
    JSON.stringify(graph.getFeatures(), null, '\t')
);
*/