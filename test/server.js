const io = require("socket.io-client");
const should = require("should");
const socketURL = "http://0.0.0.0:8081";
const assert = require("chai").assert;
const getAlivePlayers = require("../server/gameserver").getAlivePlayers;
const startRoundIfAllReady = require("../server/gameserver").startRoundIfAllReady;
const calculateDmg = require("../server/gameserver").calculateDmg;
const createPlayer = require("../server/gameserver").createPlayer;
const getNextPlayerSocketId = require("../server/gameserver").getNextPlayerSocketId;
const nextPlayerAlias = require("../server/gameserver").nextPlayerAlias;
const chatUser1 = { name: "Tom" };
const chatUser2 = { name: "Sally" };
const chatUser3 = { name: "Dana" };

describe("Username broadcast", function() {
    it("Should broadcast usernames to all users", done => {
        var client1 = io.connect(socketURL);

        client1.on('connect', () => {
          client1.emit('username', chatUser1);

          var client2 = io.connect(socketURL);

          client2.on('connect', () => {
            client2.emit('username', chatUser2);
          });

          client2.on('new user', usersName => { // !!!!
            usersName.should.equal(chatUser2.name + " has joined.");
            client2.disconnect();
          });
        });

        var numUsers = 0;
        client1.on('new user', usersName => {
          numUsers += 1;

          if(numUsers === 2){
            usersName.should.equal(chatUser2.name + " has joined.");
            client1.disconnect();
            done();
          }
        });
    });
});

describe("RemovePlayer broadcast", function() {
  it("Should return one player remaining after two connects and one removal", done => {
    var client1 = io.connect(socketURL);
    
    client1.on('connect', () => {
      
      var client2 = io.connect(socketURL);
      client2.on('connect', () => {
        client1.emit('clientReady');
        client2.emit('clientReady');
        client2.emit('disconnect');
        client2.disconnect();
  
  
        client1.emit('disconnect');
        client1.disconnect();
      });

      done();
      
      // client1.on('currentPlayers', players => {
        
      // });
      
      
      // client2.on('connect', () => {
        
      //   client1.emit('disconnect');
      // });
    });
    
  });
});

// Removeplayer number of players left
// Removing player that doesn't exist

// playerMovement, Mock movementData, send to other clients, check correct info

// removeTiles Check correct tiles removed, remove tiles that don't exist

// playerWon Only player left is the one that won, more than two players alive results in?

// fireBullet has proper bulletInfo

// finishedTurn

// countCOnnectedPlayers, proper count variants

// startRoundIfAllReady, force it without all ready

// nextPlayerAlias

//

describe("getAlivePlayers", function() {
  let id1 = "DEAD";
  let id2 = "ksjfbnksjbv";
  let id3 = "09y8724roiuhf";
  let id4 = "nidjfbvuyqwefd7263rfuyv2r7t24087y3487er";

  let playerArray = [];
  playerArray.push(id1);
  playerArray.push(id2);
  playerArray.push(id3);
  playerArray.push(id4);

  it("Removes one player tagged as DEAD, returns rest of players", () => {
    const result = getAlivePlayers(playerArray);

    assert.deepEqual(result, playerArray.slice(1, playerArray.length));
  });

  it("Replaces dead player with proper tag and returns all players", () => {
    playerArray[0] = "sfjdsnlvdfksjnvdf";
    let result = getAlivePlayers(playerArray);
    assert.deepEqual(result, playerArray);
  });

  it("Returns empty array when all players are tagged as DEAD", () => {
    playerArray[0] = "DEAD";
    playerArray[1] = "DEAD";
    playerArray[2] = "DEAD";
    playerArray[3] = "DEAD";

    let result = getAlivePlayers(playerArray);
    assert.deepEqual(result, []);
  });
});

describe("startRoundIfAllReady", function() {
  it("With no players ready, doesn't start round", () => {
    let x = startRoundIfAllReady([]);
    assert.deepEqual(x, false);
  });
});

describe("calculateDmg", function() {
  it("Returns correct damage calculation with player inside explosion radius", () => {
    let explosion = {
      dmg: 32,
      radius: 32,
      x: 13,
      y: 13
    };

    let player = {
      x: 15,
      y: 15
    };
    let result = calculateDmg(explosion, player);

    assert.equal(result, explosion.dmg);
    assert.notEqual(result, 15);
  });

  it("Returns zero damage with player outside explosion radius", () => {
    let explosion = {
      dmg: 32,
      radius: 0,
      x: 13,
      y: 13
    };

    let player = {
      x: 75,
      y: 75
    };

    let result2 = calculateDmg(explosion, player);

    assert.equal(result2, 0);
  });

  it("Returns partial damage to player when distance <= radius", () => {});
});

describe("createPlayer", function() {
  it("gives proper player values when given proper arguments", () => {
    let players = {};
    let playerOrder = [];
    let id1 = "1kjgfkjdfbv";
    let id2 = "2oiehrgodnf";
    let id3 = "3ljebnfvdfv";
    let id4 = "4lkejngjdfn";
    let alias1 = "Player Adam";
    let alias2 = "Player Edvin";
    let alias3 = "Player Caspar";
    let alias4 = "Player Tor";
    let alias5 = "Player Nurre";

    let result1 = createPlayer(players, id1, alias1, playerOrder);
    assert.equal(result1.alias, alias1);

    playerOrder.push(id1);
    let result2 = createPlayer(result1, id2, alias2, playerOrder);
    assert.equal(result2.alias, alias2);
  });
});

describe("getNextPlayerSocketId", function() {
  it("Returns expected player socket Id value and playerOrder index of socket Id", () => {
    let playerOrder = ['DEAD', 'DEAD', 'C', 'DEAD'];

    let result1 = getNextPlayerSocketId(playerOrder, 2);
    assert.equal(result1[0], 'C');
    assert.equal(result1[1], 2);

    let playerOrder2 = ['DEAD', 'B', 'C', 'D'];
    let result2 = getNextPlayerSocketId(playerOrder2, 3);
    assert.equal(result2[0], 'B');
    assert.equal(result2[1], 1);

    let playerOrder3 = [];
    let result3 = getNextPlayerSocketId(playerOrder3, 0);
    assert.equal(result3, undefined);
  });
});

describe("nextPlayerAlias", function () {
  it("Returns correct alias with multiple players", () => {
    let playerOrder = ['DEAD', 'B', 'C', 'D'];
    let players = 
      {'DEAD': {alias: 'Player 0'},
       'B': {alias: 'Player 1'},
       'C': {alias: 'Player 2'},
       'D': {alias: 'Player 3'}}
    let result = nextPlayerAlias(playerOrder, 0, players);
    assert.equal(result, 'Player 1');
  });

  it("Returns correct alias with one player", () => {
    let playerOrder = ['B'];
    let players = 
      {'B': {alias: 'Player 0'}}
    let result = nextPlayerAlias(playerOrder, 0, players);
    assert.equal(result, 'Player 0');
  });
});