const request = require('request');
const cheerio = require('cheerio');
const url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595/chennai-super-kings-vs-kings-xi-punjab-53rd-match-1216506/full-scorecard';

const birthDays = async (req, res) => {
  const details = []; 

  request(url, async(err, res, html) => {
    if (err) {
      console.log(err);
    } else {
      await extractHtml(html);
    }
  })
  
  const extractHtml = async (html) => {
    return new Promise(async (resolve, reject) => {

      let $ = cheerio.load(html);
    
      let innigsArr = $(".card.content-block.match-scorecard-table>.Collapsible");
    
      for await(let innigArr of innigsArr) {
    
        // team name
        let teamNameElem = $(innigArr).find(".header-title.label");
        let teamName = teamNameElem.text();
        teamName = teamName.split("INNINGS")[0];
        teamName = teamName.trim();
    
        // table batsman
        let tableElem = $(innigArr).find(".table.batsman");
        let allBatsMan = $(tableElem).find("tr");
    
        for await(let BatsMan of allBatsMan) {
          let allColsOfPlayer = $(BatsMan).find("td");
          let isbatsManCol = $(allColsOfPlayer[0]).hasClass("batsman-cell");
          let didNotBat = $(allColsOfPlayer).find("div").find("a");
    
          if (isbatsManCol == true) {
            let href = $(allColsOfPlayer[0]).find("a").attr("href");
            let name = $(allColsOfPlayer[0]).text();
            let fullLink = "https://www.espncricinfo.com" + href;
            console.log(fullLink);
    
            await getBirthdaypage(fullLink, name, teamName);
          }
    
          if (didNotBat) {
            
            for await(let notBat of didNotBat) {
              let href = $(notBat).attr("href");
              let name = $(notBat).text();
              let fullLink = "https://www.espncricinfo.com" + href;
              console.log(fullLink);
              
              await getBirthdaypage(fullLink, name, teamName);
            }
          }
        }
      }
      return res.status(200).json({details})
      
    })

  }
  
  const getBirthdaypage = async (url, name, teamName) => {
    return new Promise(async (resolve, reject) => {
      request(url, async(err, response, html) => {
        if (err) {
          console.log(err);
        } else {
          await extractBirthDay(html, name, teamName)
          resolve();
        }
      });
    })
  }
  
  const extractBirthDay = async (html, name, teamName) => {
    return new Promise(async (resolve, reject) => {
      let $ = cheerio.load(html);
      let detailsArr = $(".player-card-description");
      let birthDay =  $(detailsArr[1]).text();
      let age =  $(detailsArr[2]).text();
      console.log(`${name} plays for ${teamName} was born on ${birthDay} and age is ${age}`);
  
      const birthdayDetails = {
        name: name, 
        team: teamName,
        birthday: birthDay, 
        age: age
      }
      details.push(birthdayDetails);
      resolve()
    })
  }

}

module.exports = birthDays