let config = require("./config.js");
let goodreads = require('goodreads-api-node');
const grclient = goodreads(config.config_goodreads);
let log = require('./logger.js');
let logger = new log();

let book = {
    bookA : '',
    bookN : '',
    bookS : ''
}

let searchBook = {
    getBook: function(list,callback){
        let date = new Date();
        logger.log(logger.info,' Getting a book:')
        let alphabet = list.split('');
        let nr = Math.floor(Math.random() * alphabet.length);
        let letter = alphabet[nr];

        // Query for GoodRead search
        const query_book = {
            q:letter,
            page:'',
            type:'author'
        }

        grclient.searchBooks(query_book).then(response => {
            let randomNrB = Math.floor(Math.random() * response.search.results.work.length);

            do {
                randomNrB = Math.floor(Math.random() * response.search.results.work.length);
                logger.log(logger.info,'Rating of book: '+response.search.results.work[randomNrB].average_rating);
            }
            while (response.search.results.work[randomNrB].average_rating <= 3.8);
            let bookName = response.search.results.work[randomNrB].best_book.title;
            let bookAuthor = response.search.results.work[randomNrB].best_book.author.name;
            let bookId = response.search.results.work[randomNrB].best_book.id._;

            book.bookA = bookAuthor;
            book.bookN = bookName;
            book.bookS = "https://www.goodreads.com/book/show/"+bookId;
            logger.log(logger.info,' Book picked: '+ bookAuthor + ' - ' + bookName);
            callback(book);

        }).catch((err) => {
          // Handle any error that occurred in any of the previous
          // promises in the chain.
            logger.log(logger.error, ' Ended ' + err);
        });
    },
    getCover:function(book,callback){
        let date = new Date();
        logger.log(logger.info,' Getting the cover for the book');

        // Query for GoodRead search
        let query_book = {
            q:book,
            page:'',
            type:'author'
        }
        grclient.searchBooks(query_book).then(response => {
            let bookCover;
            if(typeof response.search.results.work.length == "undefined"){
              bookCover = response.search.results.work.best_book.image_url;
            }else{
              bookCover =  response.search.results.work[0].best_book.image_url;
            }
            logger.log(logger.info,' Book cover: '+bookCover);

            callback(bookCover);

        }).catch((err) => {
          // Handle any error that occurred in any of the previous
          // promises in the chain.
            logger.log(logger.error, ' Ended ' + err);
        });
    }
}


module.exports = searchBook;
