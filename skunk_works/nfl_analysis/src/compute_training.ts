import * as fs from 'fs';
import * as path from 'path';

console.log('fresh', process.memoryUsage());
import {graph} from './features';
import {calculateCompare} from './compute';
console.log('loaded', process.memoryUsage());

async function createTraining(intervals){
    const rtn = {
        keys: null,
        training: []
    };

    for (const interval of intervals){
        console.log(interval);
        console.log(process.memoryUsage());
        const weekGraph = graph.getGraph(interval);

        const proc = [];

        for (const event of weekGraph.eventDex.values()){
            const nodes = event.getNodesByType('team');

            proc.push(
                calculateCompare(interval.ref, nodes[0].ref, nodes[1].ref)
                .then((res: Record<string, number>[]) => {
                    // This is where I drop name and score
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
        console.log(process.memoryUsage());

        const proc = [];
        for (const cmp of intervalReq.compare){
            proc.push(
                calculateCompare(interval.ref, cmp.team1, cmp.team2)
                .then((res: Record<string, number>[]) => {
                    // This is where I drop name and score
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
                        label: `${interval.ref}: ${res[0].name} vs ${res[1].name}`
                    };
                })
            );
        }

        await Promise.all(proc).then(rows => {
            for (const row of rows){
                if (!rtn.keys){
                    rtn.keys = row.metadata.keys
                }

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
const intervals = available.slice(10);

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