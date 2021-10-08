const request = require("request");
const cheerio = require("cheerio");
const scorecard = require("./scorecard");

const getAllMatchesLink = async (url) => {
  return new Promise(async (resolve, reject) => {
    request(url, async (err, res, html) => {
      if (err) {
        console.log(err);
      } else {
        await extractAllLinks(html);
        resolve()
      }
    })
  })
}

const extractAllLinks = async (html) => {
  return new Promise(async (resolve, reject) => {
    let $ = cheerio.load(html);
    let scorecardElems = $("a[data-hover='Scorecard']");
  
    for await(const scorecardElem of scorecardElems) {
      let link = $(scorecardElem).attr("href");
      let scorecardLink = "https://www.espncricinfo.com" + link;
      console.log(scorecardLink);
      await scorecard.getScorecard(scorecardLink);
      resolve()
    }
  })
}

module.exports = {
  getAllMatches: getAllMatchesLink
}