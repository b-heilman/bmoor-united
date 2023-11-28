import { readSeason, readWeek } from "./access";

async function main(){
    // https://www.pro-football-reference.com/boxscores/202101090buf.htm
    // https://github.com/nntrn/nfl-nerd
    // ----------------
    // https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c#games
    // https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2021/types/2/weeks/1/events
    // https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401326315

    await readWeek(2023, 12);
   
    /*
    await readSeason(2023, 1, 11);
    await readSeason(2022, 1, 18);
    await readSeason(2021, 1, 18);
    await readSeason(2020, 1, 17);
    await readSeason(2019, 1, 17);
    await readSeason(2018, 1, 17);
    await readSeason(2017, 1, 17);
    await readSeason(2016, 1, 17);
    await readSeason(2015, 1, 17);
    */
   
    //await readPlayer('4040715');
}

main();
