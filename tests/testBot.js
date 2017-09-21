var assert = require("assert");
var bot = require("../bot.js");
const alphabet = 'abcdefghijklmnopqrstuvwxyz';

describe('Twitter Bot',function(){
    describe('Test 1:',function(){
        it('should return a function',function(done){
            assert.equal(typeof bot,'function');
            done();
        })    
    })
    describe('Test 2:',function(){
        it('should return boolean ',function(done){
            assert.equal(typeof bot(alphabet),'boolean');
            done();
        })    
    })
    describe('Test 3:',function(){
        it('should return value of true ',function(done){
            assert.equal(bot(alphabet),true);
            done();
        })    
    })
})