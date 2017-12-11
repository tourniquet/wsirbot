const randomWord = require('random-word');
let config = require("./config.js");
let grapi = require('goodreads-api-node');
const grclient = grapi(config.config_goodreads);
let log = require('./logger.js');
let logger = new log();

const goodreads = {
    // Generate random word
    word: function() {
        return randomWord()
    },
    // Check path type, if type returned is object -> it must get ._ value, else get the normal path value
    getItem: function(path) {
        if (typeof path == 'object') {
            return path._;
        } else {
            return path;
        }
    },
    // Get the book id needed for further serach of book language on different api end-point
    getBookId: function(word) {
        let self = this;
        
        logger.log(logger.info, 'Getting book process started!');
        
        // Get results of only first 3 pages
        let pageNr = Math.floor(Math.random() * 3);
        
        // Query for GoodRead search
        const query_book = {
            q: word,
            page: pageNr,
            type: 'title'
        };
        logger.log(logger.info, 'Query used for search: ');
        logger.log(logger.info, query_book);
        return new Promise((resolve, reject) => {
                // Searching for book using
                // @param: query_book
                if (typeof query_book !== 'undefined') {
                    // directly resolve with the promise
                    return resolve(grclient.searchBooks(query_book));
                } else {
                    let reason = 'No word was used to search for';
                    return reject(reason);
                }
            })
            .then((result) => {
                let search = result.search,
                    rating,
                    book_id,
                    random_nr,
                    ratings_count,
                    count = 0;
                if(parseInt(search['total-results']) == 0){
                  return false;
                }
                if (parseInt(search['total-results']) !== 0 && !Array.isArray(search.results.work)) {
                    logger.log(logger.info, 'Book data is:\n' + JSON.stringify(search.results.work));
                    rating = self.getItem(search.results.work.average_rating)
                    ratings_count = self.getItem(search.results.work.ratings_count);
                    book_id = search.results.work.best_book.id._;
                } 
                if (parseInt(search['total-results']) > 1 && Array.isArray(search.results.work)) {
                    random_nr = Math.floor(Math.random() * search.results.work.length);
                    logger.log(logger.info, 'Book data is:\n' + JSON.stringify(search.results.work[random_nr]));
                    rating = self.getItem(search.results.work[random_nr].average_rating)
                    ratings_count = self.getItem(search.results.work[random_nr].ratings_count);
                    // If the book grabed has the rating lower than 3.8 grab another book
                    do {
                        random_nr = Math.floor(Math.random() * search.results.work.length);
                        rating = self.getItem(search.results.work[random_nr].average_rating)
                        ratings_count = self.getItem(search.results.work[random_nr].ratings_count);
                        logger.log(logger.warn, 'New book data is:\n' + JSON.stringify(search.results.work[random_nr]));
                        count++;
                        if (count == 10) {
                            break;
                        }
                    } while (rating <= 3.8 && ratings_count <= 50 || rating <= 3.8 && ratings_count >= 50 || rating >= 3.8 && ratings_count <= 50)
                    if (count == 10) {
                        return false;
                    }
                    console.log(count);
                    logger.log(logger.info, 'Book rating / rating rount is ' + JSON.stringify(rating) + "/"  +JSON.stringify(ratings_count));
                    // Grab the book id when all rules are met
                    book_id = search.results.work[random_nr].best_book.id._;
                }
                if (rating <= 3.8 && ratings_count <= 50 || rating <= 3.8 && ratings_count >= 50 || rating >= 3.8 && ratings_count <= 50) {
                  return false;
                }
                
                return parseInt(book_id);
                
            })
    },
    // Finally get the book using the book id and return book data in a object containg author ,title and url.
    getBook: function(word) {
        let self = this;
        return new Promise((resolve, reject) => {
                self.getBookId(word).then((result) => {
                    if (typeof result == 'boolean') {
                        let reason = 'Book id invalid. Book not found.';
                        return reject(reason);
                    }
                    return resolve(result);
                })
            })
            .then((result) => {
                logger.log(logger.info, 'Check language for book id: ' + result);
                return new Promise((resolve, reject) => {
                    grclient.showBook(result).then((response) => {
                        let data = response.book;
                        let lang = data.language_code;
                        logger.log(logger.info, 'Book language is ' + JSON.stringify(lang));
                        if (lang == 'eng' || lang == 'en-US' || lang == 'en-GB' || lang == 'English' || lang == 'english' || lang == 'en-US') {
                            let book = {
                                title: data.title,
                                author: data.authors.author.name ? data.authors.author.name : data.authors.author[0].name,
                                url: data.url
                            }
                            return resolve(book);
                        } else {
                            let reason = 'Language is not english';
                            return reject(reason);
                        }
                    })
                })
            })
    },
     getCover: function(title) {
        let date = new Date();
        logger.log(logger.info, 'Getting the cover for the book');

        // Query for GoodReads search
        let query_book = {
            q: title,
            page: '',
            type: 'author'
        }
        return new Promise((resolve, reject) => {
                if (typeof query_book.q == 'string') {
                    grclient.searchBooks(query_book).then(response => {
                        return resolve(response);
                    })
                } else {
                    let reason = 'No book passed';
                    return reject(reason);
                }
            })
            .then((result) => {
              let bookCover;
              if (typeof result.search.results.work.length == "undefined") {
                  bookCover = result.search.results.work.best_book.image_url;
              } else {
                  bookCover = result.search.results.work[0].best_book.image_url;
              }
              logger.log(logger.info, 'Book cover: ' + bookCover);
              return bookCover;
            })
    }
}

module.exports = goodreads;
