// const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";
// Venue date opponent result runs balls fours sixes sr
const request = require("request");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const xlsx=require("xlsx");

const getScorecard = async (url) => {
  return new Promise(async (resolve, reject) => {
    request(url, async (err, res, html) => {
      if (err) {
        console.log(err);
      } else {
        await extractMatchDetails(html);
        resolve()
      }
    })
  })
}

const extractMatchDetails = async (html) => {
  return new Promise(async (resolve, reject) => {

    let $ = cheerio.load(html);
    let venueDate = $(".header-info .description");
    let matchResult = $(".event .status-text");

    let stringArr = venueDate.text().split(",");
    let venue = stringArr[1].trim();
    let date = stringArr[2].trim();
    matchResult = matchResult.text();

    let innings = $(".card.content-block.match-scorecard-table>.Collapsible");

    innings.each((i, inning) => {
      let teamName = $(inning).find("h5").text();
      teamName = teamName.split("INNINGS")[0].trim();
      let opponentIndex = i == 0 ? 1 : 0;
      let opponentName = $(innings[opponentIndex]).find("h5").text();
      opponentName = opponentName.split("INNINGS")[0].trim();
      console.log(`${venue}| ${date} |${teamName}| ${opponentName} |${matchResult}`);

      let cInning = $(innings[i]);
      let allRows = cInning.find(".table.batsman tbody tr");

      allRows.each(async (i, row) => {
        let allCols = $(row).find("td");
        let isExists = $(allCols[0]).hasClass("batsman-cell");

        if (isExists == true) {
          let playerName = $(allCols[0]).text().trim();
          let runs = $(allCols[2]).text().trim();
          let balls = $(allCols[3]).text().trim();
          let fours = $(allCols[5]).text().trim();
          let sixes = $(allCols[6]).text().trim();
          let sr = $(allCols[7]).text().trim();
          console.log(`${playerName} ${runs} ${balls} ${fours} ${sixes} ${sr}`);
          await processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentName, venue, date, matchResult);

          resolve()
        }
      })
    })
    console.log("`````````````````````````````````````````````````");
  })
}

const processPlayer = async (teamName, playerName, runs, balls, fours, sixes, sr, opponentName, venue, date, result) => {
  return new Promise(async (resolve, reject) => {
    
    let teamPath = path.join(__dirname, "ipl", teamName);
    dirCreater(teamPath);
    
    let filePath = path.join(teamPath, playerName + ".xlsx");
    let content = await excelReader(filePath, playerName);
    
    let playerObj = {
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        sr,
        opponentName,
        venue,
        date,
        result
    }
    content.push(playerObj);
    await excelWriter(filePath, content, playerName);
    resolve();
  })
}

const dirCreater = async (filePath) => {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(filePath) == false) {
        fs.mkdirSync(filePath);
    }
    resolve()
  })
}

const excelWriter = async (filePath, json, sheetName) => {
  return new Promise(async (resolve, reject) => {
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
    resolve()
  })
}

const excelReader = async (filePath, sheetName) => {
    
    if (fs.existsSync(filePath) == false) {
      return [];
    }
    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

module.exports = {
  getScorecard
}
