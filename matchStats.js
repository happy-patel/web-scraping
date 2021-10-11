const request = require('request');
const cheerio = require('cheerio');
const url = 'https://www.espncricinfo.com/series/ipl-2021-1249214/royal-challengers-bangalore-vs-punjab-kings-48th-match-1254090/full-scorecard';

const matchStats = async (req, response) => {

  // Get HTML of request
  request(url, async (err, res, html) => {
    if (err) {
      console.log(err);
    } else {
      const data = await extractHtml(html);
      return response.status(200).json(data);
    }
  })
  
  const extractHtml = async (html) => {
    
    // load HTMl into cheerio module
    let $ = cheerio.load(html);
    
    // Get the particular details from class attribute
    let venue = $(".match-venue").text();
    let match = $(".header-info .description").text().split(' ').slice(0, 2).join(' ');
    let teamNames = $(".match-info.match-info-MATCH .team .name-detail");
    let teamScores = $(".match-info.match-info-MATCH .team .score-detail .score");
    let matchDetails = $(".card.content-block.match-scorecard-table>.table-responsive").find('tr');
    let playerOfMatch = $(".playerofthematch-player-detail").text().split(', ');
    let playerOfMatchScore = $(".playerofthematch-score-text").text();
    let matchResult = $(".match-info.match-info-MATCH .status-text").text();
    let innings = $(".card.content-block.match-scorecard-table>.Collapsible");
    
    let teamNameArr = [];
    let teamScoreArr = [];

    // Get team names
    teamNames.each((i, name) => {
      teamNameArr.push($(name).text());
    })

    // Get Team Score
    teamScores.each((i, score) => {
      teamScoreArr.push($(score).text());
    })

    // Get Match Date
    const dateRow = $(matchDetails[6]).find('td');
    const date = $(dateRow[1]).text().split('(')[0].trim();

    // Get Toss
    const tossRow = $(matchDetails[1]).find('td');
    const toss = $(tossRow[1]).text().split('-')[0].trim();

    // Get both Team Names and Scores
    const [team1Name, team2Name] = teamNameArr;

    const [team1Score, team2Score] = teamScoreArr;

    // Get the Best Batting Score
    let hrBatsmanName = '';
    let hrBatsmanRuns = 0;
    let hrBatsmanBalls = 0;
    let hrBatsmanFours = 0;
    let hrBatsmanSixes = 0;
    let hrBatsmanSr = 0;

    // Looping into both innings
    innings.each((i, inning) => {

      // Find batman table and get all the rows from batsman table
      let allBatsman = $(inning).find('.table.batsman tbody tr');

      // Looping into all the batsman rows
      allBatsman.each((i, batsman) => {

        // Find all the columns from particular batsman row
        let batsmanDetails = $(batsman).find('td');

        let batsmanName = $(batsmanDetails[0]).text().trim().replace(/[^a-zA-Z ]/g, "");
        let batsmanRuns = $(batsmanDetails[2]).text();
        let batsmanBalls = $(batsmanDetails[3]).text();
        let batsmanFours = $(batsmanDetails[5]).text();
        let batsmanSixes = $(batsmanDetails[6]).text();
        let batsmanSr = $(batsmanDetails[7]).text();

        // check highest batsman run and assign details
        if (batsmanRuns > hrBatsmanRuns) {
          hrBatsmanName = batsmanName;
          hrBatsmanRuns = parseInt(batsmanRuns);
          hrBatsmanBalls = parseInt(batsmanBalls);
          hrBatsmanFours = parseInt(batsmanFours);
          hrBatsmanSixes = parseInt(batsmanSixes);
          hrBatsmanSr = parseFloat(batsmanSr);
        }
      })
    })

    // Get the Best Bowling Score
    let hwBowlerName = '';
    let hwBowlerOvers = 0;
    let hwBowlerRuns = 0;
    let hwBowlerWickets = 0;
    let hwBowlerEcon = 0;

    // assignerHelper function
    const assignerHelper = async (bowlerName, bowlerOvers, bowlerRuns, bowlerWickets, bowlerEcon) => {
      hwBowlerName = bowlerName;
      hwBowlerOvers = bowlerOvers;
      hwBowlerRuns = bowlerRuns;
      hwBowlerWickets = bowlerWickets;
      hwBowlerEcon = bowlerEcon;
    }

    // Looping into both innings
    innings.each((i, inning) => {

      // Find batman table and get all the rows from batsman table
      let allBowler = $(inning).find('.table.bowler tr');

      // Looping into all the bowler rows
      allBowler.each(async (i, bowler) => {

        // Find all the columns from particular bowler row
        let bowlerDetails = $(bowler).find('td');

        let bowlerName = $(bowlerDetails[0]).text();
        let bowlerOvers = $(bowlerDetails[1]).text();
        let bowlerRuns = $(bowlerDetails[3]).text();
        let bowlerWickets = $(bowlerDetails[4]).text();
        let bowlerEcon = $(bowlerDetails[5]).text();

        // Check highest wicket and assign using helper function
        if (bowlerWickets > hwBowlerWickets) {
          await assignerHelper(bowlerName, bowlerOvers, bowlerRuns, bowlerWickets, bowlerEcon);
        } else if (bowlerWickets == hwBowlerWickets) {

          // Check lowest economy 
          if (bowlerEcon < hwBowlerEcon) {
            await assignerHelper(bowlerName, bowlerOvers, bowlerRuns, bowlerWickets, bowlerEcon);
          }
        }
      })
    })

    const data = {
      match,
      venue,
      date,
      teams: teamNameArr,
      toss,
      score: {
        team1: {
          name: team1Name,
          score: team1Score
        },
        team2: {
          name: team2Name,
          score: team2Score
        },
        result: matchResult
      },
      playerOfMatch: {
        team: playerOfMatch[1],
        name: playerOfMatch[0],
        score: playerOfMatchScore
      },
      bestBattingScore: {
        name: hrBatsmanName,
        runs: hrBatsmanRuns.toString(),
        balls: hrBatsmanBalls.toString(),
        fours: hrBatsmanFours.toString(),
        sixes: hrBatsmanSixes.toString(),
        sr: hrBatsmanSr.toString()
      },
      bestBowlingScore: {
        name: hwBowlerName,
        overs: hwBowlerOvers,
        runs: hwBowlerRuns,
        wickets: hwBowlerWickets,
        economy: hwBowlerEcon,
      }
    }
    return data;
  }
}

module.exports = matchStats;