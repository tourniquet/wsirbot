let config = require("./config.js");
let goodreads = require('goodreads-api-node');
const grclient = goodreads(config.config_goodreads);

var book = {
    bookA : '',
    bookN : '',
    bookS : ''
}

var searchBook = function(list,callback){
    var alphabet = list.split('');
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
        while (response.search.results.work[randomNrB].average_rating <= 3.8);
        var bookName = response.search.results.work[randomNrB].best_book.title;
        var bookAuthor = response.search.results.work[randomNrB].best_book.author.name;
        var bookId = response.search.results.work[randomNrB].best_book.id._;

        book.bookA = bookAuthor;
        book.bookN = bookName;
        book.bookS = "https://www.goodreads.com/book/show/"+bookId;

	    console.log(date.getHours() + ":" + date.getMinutes() + ' Book picked: '+ bookAuthor + ' - ' + bookName);
        callback(book);

    }).catch((err) => {
      // Handle any error that occurred in any of the previous
      // promises in the chain.
         console.log(date.getHours() + ":" + date.getMinutes() + ' Ended ' + err);
    });
}

module.exports = searchBook;
