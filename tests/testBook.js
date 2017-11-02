let assert = require("assert");
var chai = require("chai");
let book = require('../goodread.js');

describe('Testing books.', function(){
  describe('Test 1:', function(){
    it('Must return language object',function(){
      return book.getBook(book.word()).then(data => {
        chai.expect(data.author).to.be.a('string');
      })
    }).timeout(60000);
  });
})