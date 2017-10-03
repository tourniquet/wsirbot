//Require dependecy
var twit = require('twit');
let config = require("./config.js");
let goodreads = require('./goodread.js');

const letters = 'abcdefghijklmnopqrstuvwxyz';

// Pass the configuration to Twitter app
var Twitter = new twit(config.config_twitter);

// BOT =========================
var wsirBot = function(alphabet) {
    let date = new Date();

    console.log(date.getHours() + ":" + date.getMinutes() + ' BOT START!');
    // Check if there is any previous post
    Twitter.get('statuses/user_timeline', {
        screen_name: 'wsirbot',
        count: 1
    }, function(err, data, response) {
        if (err) {
            console.log(err)
        }
        
        // Check for tweet in case of a restart of server / malfunction
        console.log(date.getHours() + ":" + date.getMinutes() + ' Checking for tweet in the last 24h...');
        var last_tweet_date = data[0].created_at.substring(8, 11);

        if (last_tweet_date == date.getDate()) {
            console.log(date.getHours() + ":" + date.getMinutes() + 'Found tweet in the last 24h,skip tweeting now!');
        } else {
            console.log(date.getHours() + ":" + date.getMinutes() + 'No tweet found in the last 24h, tweeting now!...');

            // Get book
            goodreads.getBook(alphabet, function(data) {
                var year = date.getFullYear();
                var month;
                if (date.getMonth >= 10) {
                    month = date.getMonth();
                } else {
                    month = "0" + date.getMonth();
                }
                var day = date.getDate();
                const time = year + "-" + month + "-" + day;
                var book = data;
                var last_tweet_date;

                // Compose params for twitter
                var msg = "Today's pick:" + book.bookN +
                    '-' + book.bookA +
                    ' @ ';
                msg += book.bookS;
                const tags = ' #WSIR #book #WhatShouldIRead';

                // Set the params for the search
                var params = {
                    q: '',
                    status: msg + tags,
                    lang: 'en',
                }

                if (params.status.length >= 140) {
                    const len = book.bookA.length / 2;
                    let authorStr = book.bookA.substring(0, len);
                    authorStr += '...';
                    params.status = "Today's pick: " + book.bookN +
                        '-' + authorStr +
                        ' @ '+ book.bookS + tags;
                    console.log(date.getHours() + ":" + date.getMinutes() +'Got new status:' + params.status);
                    if (params.status.length >= 140) {
                        console.log(date.getHours() + ":" + date.getMinutes() +'New status still to long, getting a new one.');
                        wsirBot(alphabet);
                    }
                }

                // // Post the tweet
                // Twitter.post('statuses/update', params, function(err, data) {
                //     var date = new Date();
                //     // Check if error is present, if not continue
                //     if (!err) {
                //         console.log(date.getHours() + ":" + date.getMinutes() + ' Twitter INFO ' + 'Incoming data: ' + data.id + ' ' + data);
                //     } else {
                //         console.log(date.getHours() + ":" + date.getMinutes() + ' Ended...');
                //         throw err;
                //     }
                // });

            });

        }
    })

    return true;
}

// Launch the application
wsirBot(letters);

// Hack for heroku to keep app alive and log any errors
const min_log = 1000 * 60 * 5;
var logging = setInterval(function(){
    var date = new Date();
    console.log(date.getHours() + ":" + date.getMinutes() + " BOT active!...");
    console.log(date.getHours() + ":" + date.getMinutes() + " Checking if it's time to post")
    if(date.getHours() == 9){
        console.log(date.getHours() + ":" + date.getMinutes() + "Time to post. Time is: "+date.getHours() + ":" + date.getMinutes());
        wsirBot(letters);
    }else{
        console.log(date.getHours() + ":" + date.getMinutes() + " Not posting now. Time is: "+ date.getHours() + ":" + date.getMinutes() + ". Will post at 9am in the morning!");
    }
},min_log)

module.exports = wsirBot;