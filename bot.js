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
            let day = date.getDate();
            if(day.toString().length==1){
              day = "0"+date.getDate();
            }
            // Check for tweet in case of a restart of server / malfunction
            logger.log(logger.info,"Checking for tweet in the last 24h...")
            let last_tweet_date = data[0].created_at.substring(8, 10);
            if (last_tweet_date !== day && date.getHours() == 9) {
                logger.log(logger.info,"Posting.");
            }else{
                answer = true;
                logger.log(logger.info,"Post grabed:\n Post ID - " + data[0].id + "\n Post text - " + data[0].text);
            }
            return callback(answer);
        });
    },
    postTweet : function() {
            let self = this;
            logger.log(logger.info, "Tweeting process started!");
            goodreads.getBook(goodreads.word()).then((data)=>{
                logger.log(logger.info, "Got the book! Continue with tweeting process");
    
                let book = data;
    
                // Compose message to post
                let msg = "Today's pick: " + book.title +
                    "-" + book.author +
                    ". Read more at ";
                    msg+=book.url
                    
                const tags = " #wsir #book #WhatShouldIRead";
    
                let params = {
                    q: "",
                    status: msg + tags,
                    lang: "en",
                }
    
                // if message length is higher than maximum allowed on twitter, trim the author name on half
                if (params.status.length >= 280) {
                    let len = book.author.length / 2;
                    let authorStr = book.author.substring(0, len);
                    authorStr += "...";
                    params.status = "Today's pick: " + book.title +
                        "-" + authorStr +
                        " @ "+ book.url + tags;
                    logger.log(logger.info, " Got new status");
                    if (params.status.length >= 280) {
                        logger.log(logger.warn, " New status still to long, getting a new book.");
                        setTimeout(function(){
                            logger.log(logger.warn,'Timeout ended. Restart after 1s');
                            return self.postTweet()
                        },1000);
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
                })
            }).catch((err)=>{
                logger.log(logger.error,err)
                setTimeout(function(){
                    self.postTweet();
                },1000)
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

module.exports = wsirBot;
