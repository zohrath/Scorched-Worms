//const io = require('socket.io-client');
const http = require("http");
const socketIO = require("socket.io");
const socketIOClient = require("socket.io-client");
const express = require("express");
const request = require("supertest");
const port = 8081;

let gameServer = require("../server/app.js");
let server;
let httpServerAddr;

let expressApp;
// TODO array or dict
let socketClients = {};
let SOCKET_NUMBER = 0;

let socketServer;
let globalPlayer;


function addClients(){
  // TODO: make sure newSocket is connected?
  SOCKET_NUMBER += 1;
  let newSocketClient = socketIOClient.connect("http://localhost:" + port);
  socketClients[SOCKET_NUMBER] = newSocketClient;
  return newSocketClient;
}

function removeClients(clientNumber){
  // TODO: make sure newSocket is connected?
  socketClient = socketClients[clientNumber];
  socketClient.disconnect();
  delete socketClients[clientNumber];
}

/**
 * Setup Basic serrver at localhost and open a socket
 * TODO: run threaded "node server.js" on correct port
 */
beforeAll(done => {
/*   expressApp = express();
  server = http.Server(expressApp);
  gameServer.startGameServer(server);
  httpServer = server.listen(port);
  httpServerAddr = httpServer.address(); 
*/
  done();
});

/**
 *  Cleanup sockets and servers
 */
afterAll(done => {
  //server.close();
  //socketClient.disconnect();
  //httpServer.close();
  done();
});

/**
 * Run before each test
 */
beforeEach(done => {
  // Setup
  // Do not hardcode server port and address, square brackets are used for IPv6
  socketClient = addClients();
  socketClient.on("connect", () => {
    globalPlayer = gameServer.players[socketClient.id];
    done();
  });
});

/**
 * Run after each test
 */
afterEach(done => {
  // Cleanup
  Object.keys(socketClients).forEach(function (clientKey) {
    removeClients(clientKey);
  });
  done();
});

function validatePlayer(currentPlayer, socketID) {
  expect(currentPlayer.rotation).toBe(0);

  expect(currentPlayer.x).toBeGreaterThanOrEqual(0);
  expect(currentPlayer.x).toBeLessThanOrEqual(gameServer.WIDTH);

  expect(currentPlayer.y).toBeGreaterThanOrEqual(0);
  expect(currentPlayer.y).toBeLessThanOrEqual(gameServer.HEIGHT);

  expect(currentPlayer.playerId).toBe(socketID);
}

describe("basic socket.io example on connect", () => {
  //Can't catach currentPlayers event, supossed to catach incorrect playerData
  test("Test send currentPlayers to the new player", done => {
    socketClients[SOCKET_NUMBER].once("currentPlayers", players => {
      let playersLength = Object.keys(players).length;
      expect(playersLength).toBe(1);
      done();
    });
  });

});

describe("basic socket.io example with two clients", () => {
  let socketClient1;
  let socketClient2;

  beforeEach(done => {
    socketClient1 = socketClients[SOCKET_NUMBER];
    socketClient2 = addClients();
    socketClient2.on("connect", () => {
      done();
    });
  });

  test("Test send currentPlayers to the new player", done => {
    socketClient2.once("currentPlayers", players => {
      let playersLength = Object.keys(players).length;
      expect(playersLength).toBe(2);
      done();
    });
  });

  test("Test recieve newPlayer event", done => {
    socketClient1.once("newPlayer", newPlayerData => {
      console.log(newPlayerData);
      validatePlayer(newPlayerData, socketClients[SOCKET_NUMBER].id)
      done();
    });
  });

/* 
  test("Test on connect", done => {
    currentCount = Object.keys(gameServer.players).length;
    console.log("CurrC: ", currentCount);
    socketClient.on("disconnect", socketID => {
      console.log("socket HÄRRRR!", socketID);
      done();
    });
  }); */
});

