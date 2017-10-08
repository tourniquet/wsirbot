let assert = require("assert");
let bot = require("../bot.js");
const alphabet = 'abcdefghijklmnopqrstuvwxyz';

describe('Twitter Bot',function(){
    describe('Test 1:',function(){
        it('checkpost: should return true if exist false if not',function(done){
            bot.checkPost(function(answer){
                assert.equal(typeof answer,'boolean','It passed!');
                done();
            })
        })
    });
    // !!Only run this test on dev configuration!!
    describe('Test 2:',function(){
        it('postTweet: should return true if all ok, throw error if not',function(done){
          bot.postTweet(alphabet,function(answer){
                assert.equal(answer,true,('It Passed!'));
                done();
              })
        })
    });
})
