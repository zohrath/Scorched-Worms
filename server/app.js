let socketio = require("socket.io");
let players = {};
let playerOrder = []; // IDs, TODO: randomize
let playerTurnIndex = 0; //flag for whose turn it is
let io;
let clientsReady = 0;
let gameRunning = false;

let WIDTH = 800;
let HEIGHT = 600;

function startGameServer(server) {
  io = socketio.listen(server);

  io.sockets.on("connection", function(socket) {
    console.log("a user connected");
    // create a new player and add it to our players object
    if (gameRunning) {
      socket.emit("currentPlayers", players);
    } else {
      createPlayer(players, socket.id,"Player "+ playerTurnIndex);
    }
    // when a player disconnects, remove them from our players object
    socket.on("disconnect", () => {
      console.log("user disconnected");

      io.emit("removePlayer", socket.id);
      // remove this player from our players object
      removeFromPlayerOrder(socket.id);
      socket.disconnect();
      delete players[socket.id];
      // emit a message to all players to remove this player
    });

    // when a player moves, update the player data
    socket.on("playerMovement", function(movementData) {
      if (players[socket.id]) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit("playerMoved", players[socket.id]);
      }
    });
    socket.on("playerHit", function(socketId) {
      io.emit("removePlayer", socketId);
      removeFromPlayerOrder(socketId);
      players[socketId].active = false;
      //io.emit("nextPlayerTurn", playerTurnIndex); //TODO: correct?
      if(playerOrder.length <= 1){
        newRound();
      }
    });
    socket.on("bulletFired", function(inputInfo) {
      player = players[socket.id];

      bulletInfo = {
        x: player.x,
        y: player.y,
        power: inputInfo.power,
        angle: inputInfo.angle
      };

      io.emit("fireBullet", bulletInfo);
    });

    socket.on("toOtherClients", function(data) {
      var eventname = data["event"];
      delete data["event"];
      data["playerId"] = socket.id;
      socket.broadcast.emit(eventname, data);
    });

    socket.on("finishedTurn", function() {
      playerTurnIndex = getNextPlayerTurnIndex();
      let nextPlayerSocket = getNextPlayerSocket(0);
      nextPlayerSocket.emit("startTurn");
      io.emit("nextPlayerTurn", playerTurnIndex);
    });

    socket.on("clientReady", function() {
      if (typeof players[socket.id] !== "undefined") {
        console.log("readey req");

        if (!players[socket.id].ready) {
          clientsReady++;
          console.log(clientsReady);
          players[socket.id].ready = true;
        }

        if (clientsReady == playerOrder.length && clientsReady > 1) {
          // send the players object to the new player
          startRound();
        }
      }
    });

    socket.on("forceStart", function(){
      playerTurnIndex = 0;
      newRound();
    })
  });
}

function getNextPlayerSocket(offset = 1) {
  let nextPlayerIndex = getNextPlayerTurnIndex(offset);
  return io.sockets.sockets[playerOrder[nextPlayerIndex]];
}

function removeFromPlayerOrder(targetID) {
  playerOrder.forEach(function(id, i) {
    if (targetID == id) {
      playerOrder.splice(i, 1); //remove from index i and 1 element
    }
  });
}

function getNextPlayerTurnIndex(offset = 1) {
  return (playerTurnIndex + offset) % playerOrder.length;
}

function createPlayer(playersObject, id, alias) {
  playersObject[id] = {
    alias: alias,
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: HEIGHT - 50,
    playerId: id,
    playerTurn: false, //TODO randomize for 1 player to be true
    ready: false
  };
  // add id to playerOrder
  playerOrder.push(id);
}


function resetPlayers(){
  let newPlayers = {};
  playerOrder = []; //create new?
  Object.values(io.sockets.sockets).forEach(function (socket, i){
    createPlayer(newPlayers, socket.id, "Player "+i);
  });
  return newPlayers; //return or set players
}

function newRound(){
  console.log("before ",players);
  players = resetPlayers();
  
  console.log("after ",players);
  io.emit("clearScene");
  startRound();
  console.log("players ",players);
}

function startRound(){
  
  console.log("before currentPlayers",players)
  io.emit("currentPlayers", players);
  io.emit("nextPlayerTurn", playerTurnIndex);
  let nextPlayerSocket = getNextPlayerSocket(0);
  nextPlayerSocket.emit("startTurn");
  gameRunning = true;
  clientsReady = 0;
}
module.exports = { startGameServer };
