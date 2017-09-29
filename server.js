var express = require('express');
var goodreads = require("./goodread.js");
var twit = require('twit');
var path = require('path');

const config = require("./config.js");
var Twitter = new twit(config.config_twitter);

var app = express();
var date = new Date();
var port = process.env.PORT;
var year = date.getFullYear();
var month;
if(date.getMonth >=10){ date.getMonth()}else{month = "0"+date.getMonth()};
var day = date.getDate();
const time = year + "-"+month+ "-"+day;

// Add the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public'));

// Set template files path
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    Twitter.get('statuses/user_timeline', {screen_name: 'wsirbot', count:1}, function(err, data, response) {
        if(err){ console.log(err) }
        var id = data[0].id;
        var text = data[0].text.substring(13,data[0].text.indexOf('@'));
        var title = text.split(',')[0];
        console.log(time+ ': Got tweet at '+ time + " with >>\n" + "ID: "+id + "\nText: "+text);
        goodreads.getCover(title,function(cover){
            res.render('index',{cover}); 
        });
    });
})

app.listen(port || 5000);

console.log('Started web service at ' +date.getDate() +"/"+ date.getMonth() + "-"+ date.getHours() + ":" + date.getMinutes());