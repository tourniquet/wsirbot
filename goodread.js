let config = require("./config.js");
let goodreads = require('goodreads-api-node');
const grclient = goodreads(config.config_goodreads);

let book = {
    bookA : '',
    bookN : '',
    bookS : ''
}

let searchBook = {
    getBook: function(list,callback){
        let date = new Date();
        console.log(date.getHours() + ":" + date.getMinutes() + ' Getting a book:');
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
                console.log('Rating of book: '+response.search.results.work[randomNrB].average_rating);
            }
            while (response.search.results.work[randomNrB].average_rating <= 3.8);
            let bookName = response.search.results.work[randomNrB].best_book.title;
            let bookAuthor = response.search.results.work[randomNrB].best_book.author.name;
            let bookId = response.search.results.work[randomNrB].best_book.id._;

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
    },
    getCover:function(book,callback){
        let date = new Date();
        console.log(date.getHours() + ":" + date.getMinutes() + ' Getting the cover for the book');

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

    	      console.log(date.getHours() + ":" + date.getMinutes() + ' Book cover: '+bookCover);
            callback(bookCover);

        }).catch((err) => {
          // Handle any error that occurred in any of the previous
          // promises in the chain.
             console.log(date.getHours() + ":" + date.getMinutes() + ' Ended ' + err);
        });
    }
}


module.exports = searchBook;
