let express = require('express');
let goodreads = require("./lib/goodread.js");
let twit = require('twit');
let path = require('path');
let log = require('./lib/logger.js');
const config = require("./lib/config.js");
let Twitter = new twit(config.config_twitter);

let app = express();
let port = process.env.PORT;
let logger = new log();

// Add the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public'));

// Set template files path
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {

    Twitter.get('statuses/user_timeline', {screen_name: 'wsirbot', count:1}, function(err, data, response) {
        if(err){ console.log(err) }
        let id = data[0].id;
        let url = data[0].text.substring(data[0].text.indexOf("@")+1,data[0].text.indexOf(" #"));
        let text = data[0].text.substring(13,data[0].text.indexOf('@'));
        let title = text.split('-')[0];
        let msg = ": Got tweet" + " with >>\n" + " ID: "+id + "\n Text: "+text;
        logger.log(logger.info,msg);
        goodreads.getCover(title,function(cover){
            res.render('index',{text,cover,url});
        });
    });
})

app.get('/contest', function(req, res){
    let data = require('./public/assets/data.json');
    res.render('contest',{data});
});


app.listen(port || 5000,function(){
    logger.log(logger.info, 'Started web service on ' + this.address().port );
});
