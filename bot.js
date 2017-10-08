//Require dependecy
let twit = require("twit");
let config = require("./config.js");
let goodreads = require("./goodread.js");


// Pass the configuration to Twitter app
let Twitter = new twit(config.config_twitter);

// BOT =========================
let wsirBot = {
    letters : "abcdefghijklmnopqrstuvwxyz",
    checkPost: function(callback){
        let date = new Date();
        let answer = false;
        Twitter.get("statuses/user_timeline", {
            screen_name: "wsirbot",
            count: 1
            }, function(err, data, response) {
            if (err) {
                console.log(err)
            }

            // Check for tweet in case of a restart of server / malfunction
            console.log(date.getHours() + ":" + date.getMinutes() + " Checking for tweet in the last 24h...");
            let last_tweet_date = data[0].created_at.substring(8, 11);
            if (last_tweet_date == date.getDate()) {
                answer = true;
                console.log(date.getHours() + ":" + date.getMinutes() + " Post grabed:\n Post ID - " + data[0].id + "\n Post text - " + data[0].text);
            }
            return callback(answer);
        });
    },
    postTweet : function(letters,callback) {
    let date = new Date();
    let self = this;
    console.log(date.getHours() + ":" + date.getMinutes() + " Tweeting process START!");
        // Get book
        goodreads.getBook(letters, function(data) {
            let done = false;
            console.log(date.getHours() + ":" + date.getMinutes() + " Got the book! Continue with tweeting process");
            let year = date.getFullYear();
            let month;
            if (date.getMonth >= 10) {
                month = date.getMonth();
            } else {
                month = "0" + date.getMonth();
            }
            let day = date.getDate();
            let time = year + "-" + month + "-" + day;
            let book = data;
            let last_tweet_date;

            // Compose params for twitter
            let msg = "Today's pick:" + book.bookN +
                "-" + book.bookA +
                " @ ";
            msg += book.bookS;
            const tags = " #WSIR #book #WhatShouldIRead";

            // Set the params for the search
            let params = {
                q: "",
                status: msg + tags,
                lang: "en",
            }

            if (params.status.length >= 140) {
                let len = book.bookA.length / 2;
                let authorStr = book.bookA.substring(0, len);
                authorStr += "...";
                params.status = "Today's pick: " + book.bookN +
                    "-" + authorStr +
                    " @ "+ book.bookS + tags;
                console.log(date.getHours() + ":" + date.getMinutes() +" Got new status:" + params.status);
                if (params.status.length >= 140) {
                    console.log(date.getHours() + ":" + date.getMinutes() +" New status still to long, getting a new one.");
                    self.postTweet(self.letters,function(answer){
                      console.log('Post finished: ' + answer)
                    });
                }
            }

            // Post the tweet
            Twitter.post("statuses/update", params, function(err, data) {
                let date = new Date();
                // Check if error is present, if not continue
                 if (!err) {
                     console.log(date.getHours() + ":" + date.getMinutes() + " Twitter INFO " + "Incoming data: " + data.id + " " + data);
                     done = true;
                 } else {
                     console.log(date.getHours() + ":" + date.getMinutes() + " Ended...");
                 }
                 return callback(done);
            });
        });
    }
}

// Launch the application
wsirBot.checkPost(function(answer){
    let date = new Date();
    console.log(date.getHours() + ":" + date.getMinutes() + " Application START!");
    // One more check as Heroku does random restarts.
    if(answer){
        console.log(date.getHours() + ":" + date.getMinutes() + " Skiped posting. Found tweet.");
    }else{
        console.log(date.getHours() + ":" + date.getMinutes() + " No tweet found after restart app.");
        wsirBot.postTweet(wsirBot.letters,function(answer){
          console.log('Post finished: ' + answer)
        });
    }
})

// Hack for heroku to keep app alive and log any errors
const min_log = 1000 * 60 * 15;
let logging = setInterval(function(){
    let date = new Date();
    console.log(date.getHours() + ":" + date.getMinutes() + " BOT active!...");
    console.log(date.getHours() + ":" + date.getMinutes() + " Checking if it's time to post")
    if(date.getHours() == 9){
        wsirBot.checkPost(function(answer){
            if(answer){
                console.log(date.getHours() + ":" + date.getMinutes() + " Tweet found! Skip posting until tomorrow.");
            }else{
                console.log(date.getHours() + ":" + date.getMinutes() + " Time to post, no tweet found");
                wsirBot.postTweet(wsirBot.letters,function(answer){
                  console.log('Post finished: ' + answer)
                });
            }
        })
    }else{
        console.log(date.getHours() + ":" + date.getMinutes() + " Not posting now. Time is: "+ date.getHours() + ":" + date.getMinutes() + ". Will post at 9am in the morning!");
    }
},min_log)

module.exports = wsirBot;
