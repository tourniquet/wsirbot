var assert = require("assert");
var book = require('../goodread.js');
const alphabet = 'abcdefghijklmnopqrstuvwxyz';

describe('Get Books', function(){
  describe('Test 1:', function(){
    it('should have a book function', function(){
        assert.equal(typeof book, 'function'); 
    });
  })
  describe('Test 2:',function(){
    it('should return a book object',function(done){
        book(alphabet,function(data){
            assert.equal(typeof data,'object');
            done();
        })
    })
  });
  describe('Test 3:',function(){
      it('should return string type for each book properties',function(done){
          book(alphabet,function(data){
            assert.equal(typeof data.bookA,'string');
            assert.equal(typeof data.bookN,'string');
            assert.equal(typeof data.bookS,'string');
            done();
        })
      })
  })
});