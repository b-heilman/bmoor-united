import * as fs from 'fs';
import * as path from 'path';

import {graph} from './features';
import {
    calculateCompare,
    offenseProperties,
    defenseProperties,
    teamProperties
} from './compute';

function reducePairing(res: Record<string, number>[]){
    const compare = [];
                
    for (const row of res){
        const offProps = []
        for (const key in Object.keys(offenseProperties)){
            offProps.push(row[key]);
        }

        const defProps = []
        for (const key in Object.keys(defenseProperties)){
            defProps.push(row[key]);
        }

        const teamProps = []
        for (const key in Object.keys(teamProperties)){
            teamProps.push(row[key]);
        }

        compare.push([
            offProps,
            defProps,
            teamProps
        ]);
    }

    return compare;
}

const keys = [
    Object.keys(offenseProperties),
    Object.keys(defenseProperties),
    Object.keys(teamProperties)
];

async function createTraining(intervals){
    const rtn = {
        keys,
        training: []
    };

    for (const interval of intervals){
        console.log(interval);
        const weekGraph = graph.getGraph(interval);

        const proc = [];

        for (const event of weekGraph.eventDex.values()){
            const nodes = event.getNodesByType('team');

            proc.push(
                calculateCompare(interval.ref, nodes[0].ref, nodes[1].ref)
                .then((res: Record<string, number>[]) => {
                    // This is where I drop name and score
                    const compare = reducePairing(res)

                    const diff = res[0].score - res[1].score;
                    const labels = [
                        diff > 0 ? 1 : 0, // win
                        diff >= 4 ? 1 : 0, // win by 4
                        diff >= 7 ? 1 : 0, // win by 7
                        diff <= -7 ? 1 : 0, // lost by 7
                        diff <= -4 ? 1 : 0, // lost by 4
                        diff < 0 ? 1 : 0, // lost
                    ]
                
                    return {
                        metadata: {
                            keys
                        },
                        compare,
                        labels
                    };
                })
            );
        }

        await Promise.all(proc).then(rows => {
            for (const row of rows){
                rtn.training.push([row.compare, row.labels]);
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

interface AnalysisRequest {
    interval: string,
    compare: {
        team1: string
        team2: string
    }[]
}

async function createAnalysis(request: AnalysisRequest[]){
    const rtn = {
        keys: null,
        analysis: []
    };

    for (const intervalReq of request){
        const interval = graph.getInterval(intervalReq.interval);

        console.log(interval);

        const proc = [];
        for (const cmp of intervalReq.compare){
            proc.push(
                calculateCompare(interval.ref, cmp.team1, cmp.team2)
                .then((res: Record<string, number>[]) => {
                    // This is where I drop name and score
                    const compare = reducePairing(res);
                
                    return {
                        metadata: {
                            keys
                        },
                        compare,
                        label: `${interval.ref}: ${res[0].name} vs ${res[1].name}`
                    };
                })
            );
        }

        await Promise.all(proc).then(rows => {
            for (const row of rows){
                rtn.analysis.push([row.compare, row.label]);
            }
        });
    }

    fs.writeFileSync(
        path.join(__dirname, `../data/analysis.json`),
        JSON.stringify(rtn, null, 2),
        {encoding: 'utf-8'}
    );

    return rtn;
}

const available = Array.from(graph.intervals.values());
const intervals = available.slice(11);

createTraining(intervals)
.then(() => createAnalysis([
    {
        interval: '2023-13',
        compare: [{
            team1: 'PHI', 
            team2: 'DAL' // win
        }, {
            team1: 'NE', // win
            team2: 'PIT'
        }, {
            team1: 'TB', // win
            team2: 'ATL'
        }, {
            team1: 'DET',
            team2: 'CHI' // win
        }, {
            team1: 'IND',
            team2: 'CIN' // win
        }, {
            team1: 'CAR',
            team2: 'NO' // win
        }, {
            team1: 'HOU',
            team2: 'NYJ' // win
        }, {
            team1: 'LAR',
            team2: 'BAL' // win
        }, {
            team1: 'MIN', // win
            team2: 'LV' 
        }, {
            team1: 'SEA', 
            team2: 'SF' // win
        }, {
            team1: 'BUF', // win
            team2: 'KC' 
        }, {
            team1: 'DEN', // win
            team2: 'LAC' 
        }, {
            team1: 'TEN', // win
            team2: 'MIA' 
        }, {
            team1: 'GB', 
            team2: 'NYG' // win
        }]
    },
    {
        interval: '2023-14',
        compare: [{
            team1: 'LAC', 
            team2: 'LV' 
        },{
            team1: 'MIN', 
            team2: 'CIN' 
        },{
            team1: 'PIT',
            team2: 'IND'
        }, {
            team1: 'DEN',
            team2: 'DET'
        }, {
            team1: 'NYG', 
            team2: 'NO'
        }, {
            team1: 'CHI', 
            team2: 'CLE'
        }, {
            team1: 'ATL',
            team2: 'CAR' 
        }, {
            team1: 'TB',
            team2: 'GB' 
        }, {
            team1: 'NYJ',
            team2: 'MIA' 
        }, {
            team1: 'KC',
            team2: 'NE' 
        }, {
            team1: 'HOU',
            team2: 'TEN' 
        }, {
            team1: 'SF', 
            team2: 'ARI' 
        }, {
            team1: 'WSH', 
            team2: 'LAR' 
        }, {
            team1: 'DAL',
            team2: 'BUF' 
        }, {
            team1: 'BAL',
            team2: 'JAX' 
        }, {
            team1: 'PHI',
            team2: 'SEA' 
        }]
    }
]))
.then(() => console.log('--done--'));




// TEN