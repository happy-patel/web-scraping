const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
const fs = require("fs");
const path = require("path");
// Venue date opponent result runs balls fours sixes sr
const request = require("request");
const cheerio = require("cheerio");

const allMatch = require("./allMatch");

const getPlayerDetails = async (req, res) => {

  const dirCreater = async (filePath) => {
    return new Promise(async (resolve, reject) => {
      if (fs.existsSync(filePath) == false) {
          fs.mkdirSync(filePath);
      }
      resolve()
    })
  }

  const iplPath = path.join(__dirname, "ipl");
  await dirCreater(iplPath);
  
  request(url, async (err, res, html) => {
    if (err) {
      console.log(err);
    } else {
      await extractLink(html);
    }
  })
  
  const extractLink = async (html) => {
    return new Promise(async (resolve, reject) => {
      let $ = cheerio.load(html);
      let anchorElem = $("a[data-hover='View All Results']");
      let link = anchorElem.attr("href");
      let viewAllResultLink = "https://www.espncricinfo.com" + link;
    
      await allMatch.getAllMatches(viewAllResultLink);
      resolve();
    })
  }
  
}

module.exports = getPlayerDetails