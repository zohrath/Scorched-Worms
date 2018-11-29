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
      createPlayer(players, socket.id, "Player " + playerOrder.length);
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
      let alivePlayers = getAlivePlayers();
      if (alivePlayers.length <= 1) {
        if (alivePlayers.length == 1) {
          io.emit("playerWon", players[alivePlayers[0]].alias);
        } else if (alivePlayers.length < 1) {
          io.emit("playerWon");
        }
        newRound();
      }
    });
    socket.on("bulletFired", function(inputInfo) {
      player = players[socket.id];

      bulletInfo = {
        x: player.x,
        y: player.y,
        power: inputInfo.power,
        angle: inputInfo.angle,
        alias: player.alias
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
      newTurn(2000);
    });

    socket.on("clientReady", function() {
      if (typeof players[socket.id] !== "undefined") {
        if (!players[socket.id].ready) {
          clientsReady++;
          players[socket.id].ready = true;
        }

        if (clientsReady == playerOrder.length && clientsReady > 1) {
          // send the players object to the new player
          startRound();
        }
      }
    });

    //// FOR DEVELOPMENT
    socket.on("forceStart", function() {
      newRound();
    });
  });
}

function nextPlayerAlias() {
  let playerSocketID;
  do {
    playerTurnIndex = getNextPlayerTurnIndex();
    playerSocketID = playerOrder[playerTurnIndex];
  } while (playerSocketID == "DEAD");
  return players[playerSocketID].alias;
}

function removeFromPlayerOrder(targetID) {
  playerOrder.forEach(function(id, i) {
    if (targetID == id) {
      playerOrder[i] = "DEAD"; //remove from index i and 1 element
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

function resetPlayers() {
  let newPlayers = {};
  playerOrder = []; //create new?
  Object.values(io.sockets.sockets).forEach(function(socket, i) {
    let newAlias = "Player "  + i;//(socket.id in players) ? players[socket.id].alias : "Player " + i;
    createPlayer(newPlayers, socket.id, newAlias);
  });
  return newPlayers; //return or set players
}

function newRound() {
  playerTurnIndex = 0;
  players = resetPlayers();
  io.emit("clearScene");
  startRound();
}

function newTurn(timeout = 0) {
  setTimeout(function() {
    io.emit("nextPlayerTurn", nextPlayerAlias());
  }, timeout); //delay to sync allowedToEmit and bullet destroy
}

function startRound() {
  io.emit("currentPlayers", players);
  newTurn();
  gameRunning = true;
  clientsReady = 0;
}

function getAlivePlayers() {
  let aliveArray = [];
  playerOrder.forEach(function(id) {
    if (id !== "DEAD") {
      aliveArray.push(id);
    }
  });
  return aliveArray;
}

module.exports = { startGameServer };
