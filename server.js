var express = require('express');
var app = express();

var bot = require('./bot.js');

app.get('/', (res,req) => {
  res.send('Hello world' + bot.bookN);
});

app.listen(8000);
console.log('Running');
