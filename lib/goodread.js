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
        let self = this;
        logger.log(logger.info,'Getting book process started!');
        // Query for GoodRead search
        const query_book = {
            q:word,
            page:'',
            type:'title'
        };
        
        // Return promise 
        return new Promise((resolve) =>{
            //Searching for book using @param: query_book
            grclient.searchBooks(query_book).then(response => {
                
                logger.log(logger.info,'Searchging with:'+ JSON.stringify(query_book));
                let results = response.search.results;
                console.log(response);
                // Results should have work object otherwise retry
                if(typeof results.work =='undefined'){
                        logger.log(logger.error,'Results.work is : '+JSON.stringify(results.work));
                        setTimeout(
                            function(){
                                logger.log(logger.warn,'Timeout ended. Restart after 1s');
                                resolve(self.getBook(self.word()));
                        },1001);
                }else{
                    // Get random number base on how many books there are
                    let randomNrB = Math.floor(Math.random() * results.work.length);
                    let rating,
                        bookId;
                    logger.log(logger.info,'Typeof results.work[randomNrB] is:' + typeof  results.work[randomNrB])
                    if(typeof results.work[randomNrB] === "undefined" && results.work.average_rating._ < 3.8){
                        // If only one book is found and it's rating is lower than needed => restart
                        logger.log(logger.error,'Results.work undefined');
                        setTimeout(
                            function(){
                                logger.log(logger.warn,'Timeout ended. Restart after 1s')
                                resolve(self.getBook(self.word()));
                        },1001);
                    }else if(typeof results.work[randomNrB] === "undefined"  && typeof results.work.average_rating._ === "undefined"){
                        // If rating is heigher than 3.8 and only one book is found, continue getting data
                        rating = results.work.average_rating;
                        bookId = results.work.best_book.id._;
                    }else{
                        // If the book grabed has the rating lower than 3.8 grab another book
                        do {
                            randomNrB = Math.floor(Math.random() * results.work.length);
                            rating = results.work[randomNrB].average_rating;
                            logger.log(logger.info,'Results.work[nr]:'+JSON.stringify(results.work[randomNrB]));
                            logger.log(logger.info,'New rating of book: '+ JSON.stringify(rating));
                        }while(rating <= 3.8)
                        // Grab the book id when all rules are met
                        bookId = results.work[randomNrB].best_book.id._;
                    }
                    
                    // Get the book details using the id @param: bookId
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
                            setTimeout(function(){
                                 resolve(book);     
                            },1000);
                        }else{
                            logger.log(logger.error,'Language is not english. Restarting process');
                            setTimeout(
                                function(){
                                    logger.log(logger.warn,'Timeout ended. Restart after 1s');
                                    resolve(self.getBook(self.word()));
                            },1001);
                        }
                    })
                    .catch((err) => {
                      // Handle any error that occurred in any of the previous
                      // promises in the chain.
                        logger.log(logger.error, 'Ended ' + err);
                    });
                }
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
