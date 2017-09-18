let config = require("./config.js");
let goodreads = require('goodreads-api-node');
const grclient = goodreads(config.config_goodreads);
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

var book = {
    bookA : '',
    bookN : '',
    bookS : ''
}

var searchBook = function(callback){
    var date = new Date();
    var nr = Math.floor(Math.random() * alphabet.length);
    var letter = alphabet[nr];
    
    // Query for GoodRead search
    const query_book = {
        q:letter,
        page:'',
        type:'author'
    }
    
    grclient.searchBooks(query_book).then(response => {
        var randomNrB = Math.floor(Math.random() * response.search.results.work.length);
        
        do {
            randomNrB = Math.floor(Math.random() * response.search.results.work.length);
            console.log('Rating of book: '+response.search.results.work[randomNrB].average_rating);
        }
        while (response.search.results.work[randomNrB].average_rating <= 4);
        
        var bookName = response.search.results.work[randomNrB].best_book.title;
        var bookAuthor = response.search.results.work[randomNrB].best_book.author.name;
        var siteSource = response.search.source;
        
        
        book.bookA = bookAuthor;
        book.bookN = bookName;
        book.source = siteSource;
        
	    console.log(date.getHours() + ":" + date.getMinutes() + ' Book picked: '+ bookAuthor + ' - ' + bookName);
	    
        callback(book);

    }).catch((err) => {
      // Handle any error that occurred in any of the previous
      // promises in the chain.
         console.log(date.getHours() + ":" + date.getMinutes() + ' Ended ' + err);
    });
}

module.exports = searchBook;
