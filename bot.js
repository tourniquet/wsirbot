//Require dependecy
var twit = require('twit');
const goodreads = require('goodreads-api-node');
const authorList = require('./authors.js');
var config = require("./config.js");

// create a rolling file logger based on date/time that fires process events
// const opts = {
//     errorEventName:'error',
//     logDirectory:'./logs', // NOTE: folder must exist and be writable...
//     fileNamePattern:'roll-<DATE>.log',
//     dateFormat:'YYYY.MM.DD'
// };
//
// const log = require('simple-node-logger').createRollingFileLogger( opts );

// Pass the configuration to Twitter app
var Twitter = new twit(config.config_twitter);
var grclient = goodreads(config.config_goodreads);

var book = {
    bookA : '',
    bookN : '',
    bookS : ''
}

function searchBook(){
    var books = authorList.list[0].books;
    var nr = Math.floor(Math.random() * books.length);

    // Query for GoodRead search
    const query = {
        q:books[nr],
        page:'',
        type:'all'
    }

    grclient.searchBooks(query).then(response => {
        var randomNrB = Math.floor(Math.random() * response.search.results.work.length);
        var bookName = response.search.results.work[randomNrB].best_book.title;
        var bookAuthor = response.search.results.work[randomNrB].best_book.author.name;
        var siteSource = response.search.source;
        // log.info(' GoodRead INFO '+'Author choosen today:' + bookAuthor);
        // log.info(' GoodRead INFO '+'Book choosen today:' + bookName);
        book.bookA = bookAuthor;
        book.bookN = bookName;
        book.source = siteSource;
        // Launch the application
        wsirBot(book);

    }).catch((err) => {
      // Handle any error that occurred in any of the previous
      // promises in the chain.
      // log.info(' ERROR '+err);
         console.log('Ended ' + err);
    });
}

// BOT =========================

// create the twitter function
var wsirBot = function(book){
    console.log('#WSIR Working...');
    // Set the params for the search
    var msg = "Today's pick: "+ book.bookN +
    ' / ' + book.bookA +
    '.More on ';
    var source =  'www.'+book.source+'.com';
    var tags = ' #WSIR';
    var params = {
        q:'',
        status:msg + srouce + tags,
        lang: 'en',
    }

    // for more parametes, see: https://dev.twitter.com/rest/reference/get/search/tweets

// Post a twitt
Twitter.post('statuses/update', params, function(err,data){
    // Check if error is present, if not continue
    if(!err){
        // log.info('Twitter INFO '+'Incoming data: ' + data.id + ' ' + data);
        console.log('Twitter INFO '+'Incoming data: ' + data.id + ' ' + data);
    // If error catch error
    }else{
        // log.info('Oww snap! Twitter Error: ' + err + ' but I will handle it the best i can...');
        console.log('Ended... Restarting ' + err);
        // log.info('Twitter Ended ...'+ err + ' '+'Restarting...' );
        searchBook();
    }
});
}

// Init app
searchBook();

// Repeat every 24 hour
setInterval(searchBook, 86400000);
