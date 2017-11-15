const randomWord = require('random-word');
let config = require("./config.js");
let grapi = require('goodreads-api-node');
const grclient = grapi(config.config_goodreads);
let log = require('./logger.js');
let logger = new log();

let goodreads = {
    word : function(){
        return randomWord()
    },
    getBook : function(word){
        setTimeout(function(){
          logger.log(logger.info,'Watied 1 second.');
        },1000)
        let self = this;
        logger.log(logger.info,'Getting book process started!');
        // Query for GoodRead search
        const query_book = {
            q:word,
            page:'',
            type:'title'
        };

        // Return a new promise to be used
        return new Promise((resolve) =>{
            // Searching for book using
            // @param: query_book
            grclient.searchBooks(query_book).then(response => {

              logger.log(logger.info,'Searchging with:'+ JSON.stringify(query_book));
              let search = response.search,
                  rating,
                  bookId,
                  randomNr;

              // Check how many results come back. JSON response format changes based on number of results(books author has).
              if(search['total-results'] == 1 && search.results.work.ratings_count._ > 5){
                rating = search.results.work.average_rating;
                bookId = search.results.work.best_book.id._;
              }else if(search['total-results'] > 1){
                  randomNr = Math.floor(Math.random() * search.results.work.length);
                  if((search.results.work[randomNr].average_rating._ > 3.8 || search.results.work[randomNr].average_rating > 3.8) && (search.results.work[randomNr].ratings_count._ > 5)){
                    if(typeof search.results.work[randomNr].average_rating == "object"){
                        rating = search.results.work[randomNr].average_rating._;
                    }else{
                        rating = search.results.work[randomNr].average_rating;
                    }
                    // If the book grabed has the rating lower than 3.8 grab another book
                    do {
                        randomNr = Math.floor(Math.random() * search.results.work.length);
                        if(typeof search.results.work[randomNr].average_rating == "object"){
                            rating = search.results.work[randomNr].average_rating._;
                        }else{
                            rating = search.results.work[randomNr].average_rating;
                        }
                        logger.log(logger.warn,'Results.work[randomNr]:\n'+JSON.stringify(search.results.work[randomNr]));
                    }while(rating <= 3.8)
                    logger.log(logger.info,'Rating of book is: '+ JSON.stringify(rating));
                    // Grab the book id when all rules are met
                    bookId = search.results.work[randomNr].best_book.id._;
                  }else{
                    logger.log(logger.error,'Rating lower than 3.8 or rating lower less than 5. Restart process. ' );
                    return resolve(self.getBook(self.word()));
                  }
                }else{
                    logger.log(logger.error,'None of the criteria for book search are met. Getting new book.');
                    return resolve(self.getBook(self.word()));
                }

                // Get the book details using the id
                // @param: bookId
                grclient.showBook(bookId).then(response => {
                    let data = response.book;
                    let lang  = data.language_code;
                    logger.log(logger.info, 'Book language is '+ JSON.stringify(lang));
                    //If the language is any form of english continue, else restart process
                    if(lang =='eng' || lang=='en-US' || lang=='en-GB' || lang=='English' || lang=='english' || lang=='en-US'){
                        // Grab book details
                        let book ={
                            title:data.title,
                            author:data.authors.author.name ? data.authors.author.name : data.authors.author[0].name,
                            url:data.url
                        }
                        logger.log(logger.info, 'Grabbing book finished ' + JSON.stringify(book));
                        // Resolve promise and return the book details
                        return resolve(book);
                    }else{
                        logger.log(logger.error,'Language is not english. Restarting process');
                        return resolve(self.getBook(self.word()));
                    }
                })
                .catch((err) => {
                  // Handle any error that occurred in any of the previous
                  // promises in the chain.
                    logger.log(logger.error, 'Ended ' + err);
                });
            })
        })
        .catch((err) => {
          // Handle any error that occurred in any of the previous
          // promises in the chain.
            logger.log(logger.error, 'Ended ' + err);
        });
    },
    getCover:function(book,callback){
        let date = new Date();
        logger.log(logger.info,'Getting the cover for the book');

        // Query for GoodReads search
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
            logger.log(logger.info,'Book cover: '+bookCover);
            callback(bookCover);
        }).catch((err) => {
          // Handle any error that occurred in any of the previous
          // promises in the chain.
            logger.log(logger.error, 'Ended ' + err);
        });
    }
}

module.exports = goodreads;
