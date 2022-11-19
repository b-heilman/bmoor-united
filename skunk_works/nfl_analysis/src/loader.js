const fs = require('fs');
const path = require('path');
const {parse} = require('csv-parse');
const {Graph, prettyArray, dump} = require('@bmoor/graph');

const parser = parse({
    delimiter: ',',
    columns: true
});

const games = {};

function buildStringMap(columns){
    return function stringMap(tgt, src){
        columns.forEach(key => {
            const value = src[key];

            tgt[key] = value;
        });
    };
}

function buildNumberMerge(columns){
    return function numericMerge(tgt, src){
        columns.forEach(key => {
            const value = parseInt(src[key]);

            if (key in tgt){
                tgt[key] += value;
            } else {
                tgt[key] = value;
            }
        });
    };
}
/**
[
  "game_id",
  "player_id",
  "pos",
  "player",
  "team",
  "pass_cmp",
  "pass_att",
  "pass_yds",
  "pass_td",
  "pass_int",
  "pass_sacked",
  "pass_sacked_yds",
  "pass_long",
  "pass_rating",
  "rush_att",
  "rush_yds",
  "rush_td",
  "rush_long",
  "targets",
  "rec",
  "rec_yds",
  "rec_td",
  "rec_long",
  "fumbles_lost",
  "rush_scrambles",
  "designed_rush_att",
  "comb_pass_rush_play",
  "comb_pass_play",
  "comb_rush_play",
  "Team_abbrev",
  "Opponent_abbrev",
  "two_point_conv",
  "total_ret_td",
  "offensive_fumble_recovery_td",
  "pass_yds_bonus",
  "rush_yds_bonus",
  "rec_yds_bonus",
  "Total_DKP",
  "Off_DKP",
  "Total_FDP",
  "Off_FDP",
  "Total_SDP",
  "Off_SDP",
  "pass_target_yds",
  "pass_poor_throws",
  "pass_blitzed",
  "pass_hurried",
  "rush_yds_before_contact",
  "rush_yac",
  "rush_broken_tackles",
  "rec_air_yds",
  "rec_yac",
  "rec_drops",
  "offense",
  "off_pct",
  "vis_team",
  "home_team",
  "vis_score",
  "home_score",
  "OT",
  "Roof",
  "Surface",
  "Temperature",
  "Humidity",
  "Wind_Speed",
  "Vegas_Line",
  "Vegas_Favorite",
  "Over_Under",
  "game_date"
]
 ***/
const gameMap = buildStringMap([
    "vis_team",
    "vis_score",
    "home_team",
    "home_score",
    "OT",
    "Roof",
    "Surface",
    "Temperature",
    "Humidity",
    "Wind_Speed"
]);

const gameMerge = buildNumberMerge([
    "pass_cmp",
    "pass_att",
    "pass_yds",
    "pass_td",
    "pass_int",
    "pass_sacked",
    "rush_att",
    "rush_yds",
    "rush_td",
    "rec",
    "rec_yds",
    "rec_td",
    "fumbles_lost",
    "pass_target_yds",
    "pass_poor_throws",
    "pass_blitzed",
    "pass_hurried",
    "rush_yds_before_contact",
    "rush_yac",
    "rush_broken_tackles",
    "rec_air_yds",
    "rec_yac",
    "rec_drops"
]);

// 2019-09-05 -> 2019-12-29
// 2020-09-10 -> 2021-01-03
// 2021-09-09 -> 2022-01-09
// 2022-09-08 -> 
const seasons = {
    '2019': {
        start: new Date('2019-09-05'),
        stop: new Date('2019-12-29'),
        graph: new Graph()
    },
    '2020': {
        start: new Date('2020-09-10'),
        stop: new Date('2021-01-03'),
        graph: new Graph()
    },
    '2021': {
        start: new Date('2021-09-09'),
        stop: new Date('2022-01-09'),
        graph: new Graph()
    },
    '2022': {
        start: new Date('2022-09-08'),
        stop: new Date('2023-01-09'),
        graph: new Graph()
    }
}

function assignStats(graph, game, fromRef, toRef, fromStats, toStats){
    graph
        .connect(game, fromRef, toRef)
        .addEdgeWeight(fromRef, fromStats)
        .addEdgeWeight(toRef, toStats)
        .addEdgeWeight(fromRef, {
            blitzes: toStats.pass_blitzed,
            hurries: toStats.pass_hurried,
            sackes: toStats.pass_sacked,
            pass_allowed: toStats.pass_yds,
            run_allowed: toStats.rush_yds,
            td_allowed: toStats.pass_td + toStats.rush_td
        })
        .addEdgeWeight(toRef, {
            blitzes: fromStats.pass_blitzed,
            hurries: fromStats.pass_hurried,
            sackes: fromStats.pass_sacked,
            pass_allowed: fromStats.pass_yds,
            run_allowed: fromStats.rush_yds,
            td_allowed: fromStats.pass_td + fromStats.rush_td
        });
}

fs.createReadStream(path.join(__dirname, '../nfl_offense.csv'))
.pipe(parser)
.on('readable', function(){
    let record;
    while ((record = parser.read()) !== null) {
        let game = games[record.game_id]; 
        
        if (!game){
            game = {
                ref: record.game_id,
                date: new Date(record.game_date),
                teams: {},
            };
            
            gameMap(game, record);

            games[record.game_id] = game;
        }

        let teamName = record.team;

        if (teamName.indexOf('ERROR') !== -1){
            teamName = 'WAS';
        }

        let team = game.teams[teamName];

        if (!team){
            team = {
                score: record.team === record.home_team ? 
                    parseInt(record.home_score) : parseInt(record.vis_score)
            };

            game.teams[teamName] = team;
        }

        gameMerge(team, record);
    }
})
.on('end', function(){
    for (const game of Object.values(games)) {
        for (const season of Object.values(seasons)){
            if (game.date >= season.start && game.date <= season.stop){
                const [team1, team2] = Object.keys(game.teams);
    
                assignStats(
                    season.graph, 
                    game.ref, 
                    team1, 
                    team2, 
                    game.teams[team1], 
                    game.teams[team2]
                );
            }
        }
    }

    for(const [year, season] of Object.entries(seasons)){
        fs.writeFileSync(
            path.join(__dirname, `../seasons/${year}.json`),
            dump(season.graph)
        );
    }
});

