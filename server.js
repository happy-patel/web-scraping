const express = require('express')

const lastBallComment = require('./lbc');
const highestWicketTaker = require('./hwt');
const birthdays = require('./birthdays');
const getPlayerDetails = require('./all_teams/main');
const matchStats = require('./matchStats');

const app = express()
const port = 3000

app.get('/last-ball-comment', lastBallComment);
app.get('/highest-wicket-taker', highestWicketTaker);
app.get('/players-birthday', birthdays);

app.get('/player-details', getPlayerDetails);
app.get('/match-stats', matchStats);

app.listen(port, () => console.log(`Server is running at ${port}`))