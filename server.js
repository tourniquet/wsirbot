var express = require('express');
var app = express();
var port = process.env.PORT;

app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
  res.send('index.html');
})

app.listen(port || 5000);
console.log('Started web service at ' + Date.now());
