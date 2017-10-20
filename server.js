let express = require('express');
let goodreads = require("./goodread.js");
let twit = require('twit');
let path = require('path');
const config = require("./config.js");
let Twitter = new twit(config.config_twitter);

let app = express();
let date = new Date();
let port = process.env.PORT;
let year = date.getFullYear();
let month =  date.getMonth()+1;
let day = date.getDate();
const time = year + "-"+month+ "-"+day;

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
        console.log(time+ ': Got tweet at '+ time + " with >>\n" + " ID: "+id + "\n Text: "+text);
        goodreads.getCover(title,function(cover){
            res.render('index',{text,cover,url,bg});
        });
    });
})

app.get('/contest', function(req, res){
    let data = require('./public/assets/data.json');
    res.render('contest',{data});
});


app.listen(port || 5000,function(){
  console.log(date.getDate() +"/"+ date.getMonth() + "-"+ date.getHours() + ":" + date.getMinutes() + ' Started web service on ' + this.address().port );
});
