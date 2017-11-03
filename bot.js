//Require dependecy
let twit = require("twit");
let config = require("./lib/config.js");
let goodreads = require("./lib/goodread.js");
let log = require('./lib/logger.js');


// Pass the configuration to Twitter app
let Twitter = new twit(config.config_twitter);
let logger = new log();

// BOT =========================
let wsirBot = {
    checkPost: function(callback){
        let date = new Date();
        let answer = false;
        Twitter.get("statuses/user_timeline", {
            screen_name: "wsirbot",
            count: 1
            }, function(err, data, response) {
            if (err) {
               logger.log(logger.error,err)
            }

            // Check for tweet in case of a restart of server / malfunction
            logger.log(logger.info,"Checking for tweet in the last 24h...")
            let last_tweet_date = data[0].created_at.substring(8, 11);
            if (last_tweet_date == date.getDate()) {
                answer = true;
                logger.log(logger.info,"Post grabed:\n Post ID - " + data[0].id + "\n Post text - " + data[0].text);
            }
            return callback(answer);
        });
    },
    postTweet : function() {
            let self = this;
            logger.log(logger.info, "Tweeting process started!");
            
            goodreads.getBook(goodreads.word()).then(data =>{
            logger.log(logger.info, " Got the book! Continue with tweeting process");
            
            let book = data;
            
            // Compose message to post
            let msg = "Today's pick:" + book.title +
                "-" + book.author +
                " @ ";
                msg+=book.url
            const tags = " #wsir #book #WhatShouldIRead";
            
            let params = {
                q: "",
                status: msg + tags,
                lang: "en",
            }
            
            // if message length is higher than maximum allowed on twitter, trim the author name on half
            if (params.status.length >= 140) {
                let len = book.author.length / 2;
                let authorStr = book.author.substring(0, len);
                authorStr += "...";
                params.status = "Today's pick: " + book.title +
                    "-" + authorStr +
                    " @ "+ book.url + tags;
                logger.log(logger.info, " Got new status");
                if (params.status.length >= 140) {
                    logger.log(logger.warn, " New status still to long, getting a new book.");
                    setTimeout(function(){
                        logger.log(logger.warn,'Timeout ended. Restart after 1s');
                        self.postTweet()
                    },1000);
                    return;
                }
            }
            
            // Post the tweet message has been composed
            Twitter.post("statuses/update", params, function(err, data) {
                // Check if error is present, if not continue
                 if (!err) {
                    let message = " Tweet data: " + "ID: " + data.id +" TEXT: " +data.text +" CREATED_AT: " +data.created_at;
                    logger.log(logger.info, message);
                 } else {
                    logger.log(logger.error, err);
                 }
            });
        });
    }
}

// Launch the application
wsirBot.checkPost(function(answer){
    // One more check as Heroku does random restarts.
    if(answer){
        logger.log(logger.warn, "Skiped posting. Found tweet.");
    }else{
        logger.log(logger.warn,  "No tweet found after restart app.");
        wsirBot.postTweet();
    }
})

// Check every  set time if needs to repost or not.
const min_log = 1000 * 60 * 25;
let logging = setInterval(function(){
    let date = new Date();
    logger.log(logger.info, "BOT active!...");
    logger.log(logger.info, "Checking if it's time to post");
    if(date.getHours() == 9){
        wsirBot.checkPost(function(answer){
            if(answer){
                logger.log(logger.info, "Tweet found! Skip posting until tomorrow.");
            }else{
                logger.log(logger.info, "Time to post, no tweet found");
                wsirBot.postTweet();
            }
        })
    }else{
        logger.log(logger.warn, "Not posting now. Will post at 9am in the morning");
    }
},min_log)

module.exports = wsirBot;
