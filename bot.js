//Require dependecy
var twit = require('twit');
const config = require("./config.js");
const getBook = require('./goodread.js');
var http = require("http");

// Pass the configuration to Twitter app
var Twitter = new twit(config.config_twitter);

// BOT =========================
var wsirBot = function(){
    let date = new Date();
    
    console.log(date.getHours() + ":" + date.getMinutes() + ' #WSIR Working... ');
    
    getBook(function(data){
        var year = date.getFullYear();
        var month;
        if(date.getMonth >=10){ date.getMonth()}else{month = "0"+date.getMonth()};
        var day = date.getDate();
        const time = year + "-"+month+ "-"+day;        
        var book = data;
        var last_tweet_date;
        
        console.log(data);
        
        // Set the params for the search
        var msg = "Today's pick: "+ book.bookN +
        '--' + book.bookA +
        ' @ ';
        
        if(typeof msg.length !== "number"){
            wsirBot();
        }
        
        if(msg.length >= 140){
          const len = book.bookA.length / 2;
          let authorStr = book.bookA.substring(0, len);
          authorStr+='...';
          msg = "Today's pick: "+ book.bookN +
          '-' + authorStr +
          ' @ ';
          console.log('New MSG:'+msg);
          if(msg.length >= 140){
              wsirBot();
          }
        }
        
        var web =  'www.'+book.source+'.com';
        var tags = ' #WSIR #WhatShouldIRead #BOT';
        
        var params = {
            q:'',
            status:msg + web + tags,
            lang: 'en',
        }
        
        Twitter.get('statuses/user_timeline', {screen_name: 'wsirbot', count:1}, function(err, data, response) {
            if(err){console.log(err)}
            console.log(date.getHours() + ":" + date.getMinutes() + ' Checking for tweet in the last 24h...');
            var last_tweet_date = data[0].created_at.substring(8,11);
            if(last_tweet_date == date.getDate()){
                console.log('Found tweet in the last 24h,skip tweeting now!');
            }else{
                console.log('No tweet found in the last 24h, tweeting now!');
                // Post a tweet
            	Twitter.post('statuses/update', params, function(err,data){
            	    var date = new Date();
                	// Check if error is present, if not continue
                	if(!err){
                    	console.log(date.getHours() + ":" + date.getMinutes() + ' Twitter INFO '+'Incoming data: ' + data.id + ' ' + data);
                // If error catch error
                	}else{
                    	console.log(date.getHours() + ":" + date.getMinutes() + ' Ended...');
                    	throw err;
                	}
            	});
            }
        })
    });
}

// Launch the application
wsirBot();
    
// Repeat every 24 hour
var repeat_posting = setInterval(wsirBot, 86400000);
