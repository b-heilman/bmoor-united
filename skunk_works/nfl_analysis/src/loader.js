const fs = require('fs');
const path = require('path');
const parquet = require('parquetjs-lite');
const {Graph, dump} = require('@bmoor/graph');

const games = {};

// 2019-09-05 -> 2019-12-29
// 2020-09-10 -> 2021-01-03
// 2021-09-09 -> 2022-01-09
// 2022-09-08 -> 
const seasons = {
    '2019': new Graph(),
    '2020': new Graph(),
    '2021': new Graph(),
    '2022': new Graph()
}

function assignStats(graph, game, fromRef, toRef, fromStats, toStats){
    graph.connect('week-x', game, fromRef, toRef)
        .edge.addWeights(fromStats);

    graph.connect('week-x', game, toRef, fromRef)
        .edge.addWeights(toStats);
}

async function run(){
    /*
    const arrow = fs.readFileSync(
        path.join(__dirname, '../data/parquet/teams.parquet')
    );
    const table = tableFromIPC(arrow);

    console.log(table.toArray());
    */
    
    const reader = await parquet.ParquetReader.openFile(
        path.join(__dirname, '../data/parquet/teams.parquet')
    )
    const cursor = reader.getCursor();
    
    let record;
    while (record = await cursor.next()) {
        let game = games[record.game_id]; 
        
        if (!game){
            game = {
                ref: record.game_id,
                date: new Date(record.game_date),
                season: record.season,
                teams: {},
            };
            
            games[record.game_id] = game;
        }

        let teamName = record.team;

        if (teamName.indexOf('ERROR') !== -1){
            teamName = 'WAS';
        }

        game.teams[teamName] = record;
    }

    for (const game of Object.values(games)) {
        for (const [season, graph] of Object.entries(seasons)){
            if (game.season === season){
                const [team1, team2] = Object.keys(game.teams);

                assignStats(
                    graph, 
                    game.ref, 
                    team1, 
                    team2, 
                    game.teams[team1], 
                    game.teams[team2]
                );
            }
        }
    }

    const dir = path.join(__dirname, `../data/seasons`);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    for(const [season, graph] of Object.entries(seasons)){
        fs.writeFileSync(
            path.join(__dirname, `../data/seasons/${season}.json`),
            dump(graph)
        );
    }
}

run();