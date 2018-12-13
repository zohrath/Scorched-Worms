let socketio = require("socket.io");
let players = {};
let playerOrder = []; // IDs, TODO: randomize
let playerTurnIndex = 0; //flag for whose turn it is
let io;
let clientsReady = 0;
let gameRunning = false;

let terrain = require("./terrain.js");

let WIDTH = 800;
let HEIGHT = 600;

function startGameServer(server) {
  
  io = socketio.listen(server);

  io.sockets.on("connection", function(socket) {
    // create a new player and add it to our players object
    if (gameRunning) {
      socket.emit("currentPlayers", players);
    } else {
      createPlayer(players, socket.id, "Player " + playerOrder.length);
    }
    console.log("a user connected,", countConnectedPlayers(), "connected and", playerOrder.length, "in game.");
    // when a player disconnects, remove them from our players object
    socket.on("disconnect", () => {
      console.log("user disconnected, ", countConnectedPlayers(), "connected");

      io.emit("removePlayer", socket.id);
      // remove this player from our players object
      playerIndex = playerOrder.indexOf(socket.id);
      if (playerIndex >= 0) {
        playerOrder.splice(playerIndex, 1);
      }
      socket.disconnect();
      delete players[socket.id];
      startRoundIfAllReady();
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

    socket.on("isPlayerHit", function(explosionInfo) {
      tilesToRemove = terrain.tilesHit(explosionInfo);
      io.emit("removeTiles",tilesToRemove);
      Object.values(players).forEach(currentPlayer => {
        let playerID = currentPlayer.playerId;
        currentPlayer.hp -= calculateDmg(explosionInfo, currentPlayer);
        if (currentPlayer.hp <= 0) {
          io.emit("removePlayer", playerID);
          removeFromPlayerOrder(playerID);
          players[playerID].active = false;
        }
      });

      let alivePlayers = getAlivePlayers();
      console.log(alivePlayers);
      if (alivePlayers.length <= 1) {
        if (alivePlayers.length == 1) {
          io.emit("playerWon", players[alivePlayers[0]].alias);
        } else if (alivePlayers.length < 1) {
          io.emit("playerWon");
        }
        newRound(2000);
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

        startRoundIfAllReady();
      }
    });

    //// FOR DEVELOPMENT
    socket.on("forceStart", function() {
      newRound();
    });
  });
}

function countConnectedPlayers() {
  return Object.keys(io.sockets.sockets).length;
}

function startRoundIfAllReady() {
  if (clientsReady == playerOrder.length && clientsReady > 1) {
    // send the players object to the new player
    startRound();
  }
}
function nextPlayerAlias() {
  let playerSocketID;
  do {
    playerTurnIndex = getNextPlayerTurnIndex();
    playerSocketID = playerOrder[playerTurnIndex];
  } while (playerSocketID == "DEAD");
  if(players[playerSocketID].alias !== 'undefined'){
    return players[playerSocketID].alias;

  } else {
    return
  }
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
    y: HEIGHT - 200,
    playerId: id,
    playerTurn: false, //TODO randomize for 1 player to be true
    ready: false,
    hp: 10
  };
  // add id to playerOrder
  playerOrder.push(id);
}

function resetPlayers() {
  let newPlayers = {};
  playerOrder = []; //create new?
  Object.values(io.sockets.sockets).forEach(function(socket, i) {
    let newAlias = "Player " + i; //(socket.id in players) ? players[socket.id].alias : "Player " + i;
    createPlayer(newPlayers, socket.id, newAlias);
  });
  return newPlayers; //return or set players
}

function newRound() {
  playerTurnIndex = 0;
  players = resetPlayers();
  io.emit("updatePlatformLayer");
  io.emit("clearScene");
  startRound();
}

function newTurn(timeout = 0) {
  io.emit('syncGamestate',players);
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

function calculateDmg(explosion, player) {
  let dmg = explosion.dmg;
  let radius = explosion.radius + 32; // as player x,y is as most 32px away
  let playerDmg = 0;
  distance = getDistance(explosion.x, explosion.y, player.x, player.y);
  if (Math.hypot(32, 20) >= distance) {
    playerDmg = dmg;
  } else if (distance <= radius) {
    playerDmg = (dmg * (1 - distance / radius)).toFixed();
  }
  console.log(playerDmg);
  return playerDmg;
}

function getDistance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
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

function resetScene() {
  io.emit("resetScene");
}

module.exports = { startGameServer };
