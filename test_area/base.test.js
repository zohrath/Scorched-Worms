//const io = require('socket.io-client');
const http = require("http");
const socketIO = require("socket.io");
const socketIOClient = require("socket.io-client");
const express = require("express");
const request = require("supertest");
const port = 8080;

let gameServer = require("../server/app.js");
let server;
let httpServerAddr;

let expressApp;
let socketClient;
let socketServer;
let player;

class msocket {
  constructor(newID) {
    this.id = newID;
  }
}
/**
 * Setup Basic serrver at localhost and open a socket
 */
beforeAll(done => {
  expressApp = express();
  server = http.Server(expressApp);
  gameServer.startGameServer(server)
  httpServer = server.listen(port);
  httpServerAddr = httpServer.address();
  done();
});

/**
 *  Cleanup sockets and servers
 */
afterAll(done => {
  server.close();
  socketClient.close();
  httpServer.close();
  done();
});

/**
 * Run before each test
 */
beforeEach(done => {
  // Setup
  // Do not hardcode server port and address, square brackets are used for IPv6
  socketClient = socketIOClient.connect("http://localhost:"+port);  
  socketClient.on('connect', () => {
    console.log("On connect :", gameServer.players)
    player = gameServer.players[socketClient.id];
    done();
  });

}); 

/**
 * Run after each test
 */
afterEach(done => {
  // Cleanup
  if (socketClient.connected) {
    socketClient.disconnect();
  }
  done();
});

function validatePlayer(currentPlayer, socketID){
  expect(currentPlayer.rotation).toBe(0);

  expect(currentPlayer.x).toBeGreaterThanOrEqual(0);
  expect(currentPlayer.x).toBeLessThanOrEqual(gameServer.WIDTH);
  
  expect(currentPlayer.y).toBeGreaterThanOrEqual(0);
  expect(currentPlayer.y).toBeLessThanOrEqual(gameServer.HEIGHT);

  expect(currentPlayer.playerId).toBe(socketID);

}

describe("basic socket.io example", () => {
  
  /* Can't catach currentPlayers event, supossed to catach incorrect playerData 
  test("Test send currentPlayers to the new player", done => {
    socketClient.emit("currentPlayers")
    socketClient.once('currentPlayers', players => {
      Object.keys(players).forEach(function (key){
        currentPlayer = players[key];
        validatePlayer(currentPlayer, socketClient.id);
      });
    });
  });
 */

  test("Test player info", done => {
    console.log("On connect2 :", gameServer.players);
    validatePlayer(player, socketClient.id);
    done();
  });


});

