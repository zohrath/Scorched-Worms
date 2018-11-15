//const io = require('socket.io-client');
const http = require("http");
const socketIO = require("socket.io");
const socketIOClient = require("socket.io-client");
const express = require("express");
const request = require("supertest");
let gameServer = require("../server/app.js");

const port = 8080;
let server;
let httpServerAddr;

let expressApp;
let socketServer;
/**
 * Setup Basic serrver at localhost and open a socket
 */
beforeAll(done => {
  expressApp = express();
  server = http.Server(expressApp);
  gameServer.startGameServer(server)
  httpServer = server.listen(port);
  httpServerAddr = httpServer.address();
  socketServer = socketIO(server);

  done();
});

/**
 *  Cleanup sockets and servers
 */
afterAll(done => {
  server.close();
  socketServer.close();
  socketClient.close();
  done();
});

/**
 * Run before each test
 */
beforeEach(done => {
  // Setup
  // Do not hardcode server port and address, square brackets are used for IPv6
  socketClient = socketIOClient.connect("http://localhost:"+port);
  socketClient.on("connect", () => {
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

describe("basic socket.io example", () => {
  test("should communicate", done => {
    // once connected, emit Hello World
    socketServer.emit("echo", "Hello World");
    socketClient.once("echo", message => {
      // Check that the message matches
      expect(message).toBe("Hello World");
      done();
    });
    socketServer.on("connection", mySocket => {
      expect(mySocket).toBeDefined();
    });
  });
  test("should communicate with waiting for socket.io handshakes", done => {
    // Emit sth from Client do Server
    socketClient.emit("examlpe", "some messages");
    // Use timeout to wait for socket.io server handshakes
    setTimeout(() => {
      // Put your server side expect() here
      done();
    }, 50);
  });
});
