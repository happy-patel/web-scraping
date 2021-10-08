const request = require('request');
const cheerio = require('cheerio');
const url = 'https://www.espncricinfo.com/series/ipl-2020-21-1210595/chennai-super-kings-vs-kings-xi-punjab-53rd-match-1216506/ball-by-ball-commentary';

const lastBallComment = (req, response) => {

  request(url, async (err, res, html) => {
    if (err) {
      console.log(err);
    } else {
      const data = await extractHtml(html)
      return response.status(200).json(data)
    }
  })

  const extractHtml = async (html) => {
    let $ = cheerio.load(html);
    let over = $(".match-comment-over");
    let shortTextElemsArr = $(".match-comment-wrapper .match-comment-short-text");
    let longTextElemsArr = $(".match-comment-wrapper .match-comment-long-text");
    let teams = $(".match-info.match-info-MATCH .team");

    let winnerName, winnerScore, looserName, looserScore;

    for (let i = 0; i < teams.length; i++) {
      const isLooser = $(teams[i]).hasClass('team-gray')

      if (isLooser === false) {
        winnerName = $(teams[i]).find('a').text();
        winnerScore = $(teams[i]).find('span').text();
      } else {
        looserName = $(teams[i]).find('a').text();
        looserScore = $(teams[i]).find('span').text();
      }
    }

    let overText = $(over[0]).text();
    let shortText = $(shortTextElemsArr[0]).text();
    let longText = $(longTextElemsArr[0]).text();

    const lastBall = {
      over: overText, runs: shortText, comment: longText
    }
    const score = {
      winnerTeam: {
        name: winnerName, score: winnerScore
      },
      looserTeam: {
        name: looserName, score: looserScore
      }
    }
    return { lastBall, score }
  }
}


module.exports = lastBallComment;