var io = require('socket.io-client');
var should = require('should');
var socketURL = 'http://0.0.0.0:8081'

var chatUser1 = {'name':'Tom'};
var chatUser2 = {'name':'Sally'};
var chatUser3 = {'name':'Dana'};

describe("Basic server test functionality", function() {
    it("Should broadcast usernames to all users", (done) => {
        var client1 = io.connect(socketURL);
      
        client1.on('connect', () => {
          client1.emit('username', chatUser1);
      
          var client2 = io.connect(socketURL);
      
          client2.on('connect', () => {
            client2.emit('username', chatUser2);
          });
      
          client2.on('new user', (usersName) => {
            usersName.should.equal(chatUser2.name + " has joined.");
            client2.disconnect();
          });
        });
      
        var numUsers = 0;
        client1.on('new user', (usersName) => {
          numUsers += 1;
      
          if(numUsers === 2){
            usersName.should.equal(chatUser2.name + " has joined.");
            client1.disconnect();
            done();
          }
        });
    });
});