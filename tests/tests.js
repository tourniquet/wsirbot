let assert = require("assert");
var chai = require("chai");
let book = require('../lib/goodread.js');
let chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe('Testinging started for book', function(){
  describe('Test 1:', function(){
    it('Must return a book object containt title,author and url. Book must be in english lang',function(){
      return book.getBook('harry').then((result)=>{
        chai.expect(result).to.be.a('object');
        chai.expect(result.title).to.be.a('string');
        chai.expect(result.author).to.be.a('string');
        chai.expect(result.url).to.be.a('string');
      })
    }).timeout(60000);;
  });

  describe('Test 2:', function(){
    it('Must be rejected, because book is not found',function(){
        let result = book.getBook('tsdasda');
        return chai.expect(result).to.be.rejected;
    }).timeout(60000);;
  });

})
