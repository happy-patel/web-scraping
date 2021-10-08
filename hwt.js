const request = require('request');
const cheerio = require('cheerio');
const url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595/chennai-super-kings-vs-kings-xi-punjab-53rd-match-1216506/full-scorecard';

const highestWicketTaker = (req, response) => {

  request(url, async (err, res, html) => {
    if (err) {
      console.log(err);
    } else {
      const data = await extractHtml(html);
      return response.status(200).json(data)
    }
  })

  const extractHtml = async (html) => {
    let $ = cheerio.load(html);

    // Finding winning team name
    let teamsArr = $(".match-info.match-info-MATCH .team");
    let wTeamName;
    for (let i = 0; i < teamsArr.length; i++) {
      let hasclass = $(teamsArr[i]).hasClass("team-gray");
      if (hasclass == false) {
        // find 
        let teamNameElem = $(teamsArr[i]).find(".name");
        wTeamName = teamNameElem.text().trim();
      }
    }

    // Finding highest wicket taker name from winning team
    let innigsArr = $(".card.content-block.match-scorecard-table>.Collapsible");

    let hwtName = "";
    let hwt = 0;
    for (let i = 0; i < innigsArr.length; i++) {

      let teamNameElem = $(innigsArr[i]).find(".header-title.label");
      let teamName = teamNameElem.text();
      teamName = teamName.split("INNINGS")[0];
      teamName = teamName.trim();

      if (wTeamName !== teamName) {

        let tableElem = $(innigsArr[i]).find(".table.bowler");
        let allBowlers = $(tableElem).find("tr");

        for (let j = 0; j < allBowlers.length; j++) {
          let allColsOfPlayer = $(allBowlers[j]).find("td");
          let playerName = $(allColsOfPlayer[0]).text();
          let wickets = $(allColsOfPlayer[4]).text();

          if (wickets >= hwt) {
            hwt = wickets;
            hwtName = playerName;
          }
        }

      }
    }
    const wicketTackerDetails = {
      winningTeam: wTeamName, 
      HighestWicket: hwtName, 
      wickets: hwt
    }
    return wicketTackerDetails;
    // return res.status(200).json({wicketTackerDetails})
  }
}

module.exports = highestWicketTaker;
