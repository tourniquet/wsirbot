//Require dependecy
var twit = require('twit');
let config = require("./config.js");
let goodreads = require('./goodread.js');

const letters = 'abcdefghijklmnopqrstuvwxyz';
const min_log = 1000 * 60 * 5;
const min_repost = 1000 * 60 * 60 * 24;
// Pass the configuration to Twitter app
var Twitter = new twit(config.config_twitter);

// BOT =========================
var wsirBot = function(alphabet) {
    let date = new Date();

    console.log(date.getHours() + ":" + date.getMinutes() + ' #WSIR Working... ');
    // Check if there is any previous post
    Twitter.get('statuses/user_timeline', {
        screen_name: 'wsirbot',
        count: 1
    }, function(err, data, response) {
        if (err) {
            console.log(err)
        }
        console.log(date.getHours() + ":" + date.getMinutes() + ' Checking for tweet in the last 24h...');
        var last_tweet_date = data[0].created_at.substring(8, 11);

        if (last_tweet_date == date.getDate()) {
            console.log('Found tweet in the last 24h,skip tweeting now!');
        } else {
            console.log('No tweet found in the last 24h, tweeting now!...');

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
                        ' @ ';
                    console.log('Got new status:' + params.status);
                    if (params.status.length >= 140) {
                        console.log('New status still to long, getting a new one:' + params.status);
                        wsirBot();
                    }
                }

                // Post the tweet
                Twitter.post('statuses/update', params, function(err, data) {
                    var date = new Date();
                    // Check if error is present, if not continue
                    if (!err) {
                        console.log(date.getHours() + ":" + date.getMinutes() + ' Twitter INFO ' + 'Incoming data: ' + data.id + ' ' + data);
                    } else {
                        console.log(date.getHours() + ":" + date.getMinutes() + ' Ended...');
                        throw err;
                    }
                });

            });

        }
    })

    return true;
}

// Launch the application
wsirBot(letters);

// Hack for heroku to keep app alive and log any errors
var logging = setInterval(function(){
    var date = new Date();
    console.log(date.getHours() + ":" + date.getMinutes() + "#WSIR BOT active!...")
},min_log)

// Repeat every 24 hour / 86400000
var repeat_posting = setInterval(function() {
    wsirBot(letters);
}, min_post);

module.exports = wsirBot;
