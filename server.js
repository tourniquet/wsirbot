var express = require('express');
var app = express();
var bot = require('./bot.js');
var port = process.env.PORT;

app.get('/', (res,req) => {
  res.send('Hello world' + bot.bookN);
});

app.listen(port || 5000);
console.log('Running');
