let socketio = require("socket.io");
let players = {};
 // IDs, TODO: randomize
let playerTurnIndex = 0; //flag for whose turn it is
let io;
let clientsReady = 0;
let gameRunning = false
let currentMap;

let terrain = require("./terrain.js");

let WIDTH = 800;
let HEIGHT = 600;

// Just to get initial test running, consider pruning
var userName;
var clients = {};

function startGameServer(server) {
  let playerOrder = [];

  io = socketio.listen(server);
  
  io.sockets.on("connection", (socket) => {
    // create a new player and add it to our players object
    if (gameRunning) {
      socket.emit("currentPlayers", players);
    } else {
      createPlayer(players, socket.id, "Player " + playerOrder.length, playerOrder);
    }

    socket.on("username", (user) => {
      userName = user.name;
      clients[user.name] = socket;
      io.sockets.emit("new user", user.name + " has joined.");
    });

    console.log(
      "a user connected,",
      countConnectedPlayers(),
      "connected and",
      playerOrder.length,
      "in game."
    );
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
      startRoundIfAllReady(playerOrder);
      // emit a message to all players to remove this player
    });

    // when a player moves, update the player data
    socket.on("playerMovement", (movementData) => {
      if (players[socket.id]) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit("playerMoved", players[socket.id]);
      }
    });

    socket.on("isPlayerHit", (explosionInfo) => {
      tilesToRemove = terrain.tilesHit(explosionInfo);
      io.emit("removeTiles", tilesToRemove);
      Object.values(players).forEach(currentPlayer => {
        let playerID = currentPlayer.playerId;
        currentPlayer.hp -= calculateDmg(explosionInfo, currentPlayer);
        if (currentPlayer.hp <= 0) {
          io.emit("removePlayer", playerID);
          removeFromPlayerOrder(playerID, playerOrder);
          players[playerID].active = false;
        }
      });

      let alivePlayers = getAlivePlayers(playerOrder);
      
      if (alivePlayers.length <= 1) {
        if (alivePlayers.length == 1) {
          io.emit("playerWon", players[alivePlayers[0]].alias);
        } else if (alivePlayers.length < 1) {
          io.emit("playerWon");
        }
        // newRound(2000); // TODO: Explain argument that is never used?
        newRound(playerOrder);
      }
    });

    socket.on("bulletFired", (inputInfo) => {
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

    socket.on("toOtherClients", (data) => {
      var eventname = data["event"];
      delete data["event"];
      data["playerId"] = socket.id;
      socket.broadcast.emit(eventname, data);
    });

    socket.on("finishedTurn", () => {
      newTurn(2000, playerOrder);
    });

    socket.on("clientReady", () => {
      if (typeof players[socket.id] !== "undefined") {
        if (!players[socket.id].ready) {
          clientsReady++;
          players[socket.id].ready = true;
        }

        startRoundIfAllReady(playerOrder);
      }
    });

    //// FOR DEVELOPMENT
    socket.on("forceStart", () => {
      newRound(playerOrder);
    });
  });
}

function countConnectedPlayers() {
  return Object.keys(io.sockets.sockets).length;
}

function startRoundIfAllReady(playerOrder) {
  if (clientsReady == playerOrder.length && clientsReady > 1) {
    // send the players object to the new player
    startRound(playerOrder);
    return true;
  }
  return false;
}

function nextPlayerAlias(playerOrder) {
  let playerSocketID;

  do {
    playerTurnIndex = getNextPlayerTurnIndex(1, playerOrder);
    playerSocketID = playerOrder[playerTurnIndex];
  } while (playerSocketID == "DEAD");

  if (players[playerSocketID].alias !== "undefined") {
    return players[playerSocketID].alias;
  } else {
    return;
  }
}

function removeFromPlayerOrder(targetID, playerOrder) {
  playerOrder.forEach(function(id, i) {
    if (targetID == id) {
      playerOrder[i] = "DEAD"; //remove from index i and 1 element
    }
  });
}

function getNextPlayerTurnIndex(offset = 1, playerOrder) {
  return (playerTurnIndex + offset) % playerOrder.length;
}

function createPlayer(playersObject, id, alias, playerOrder) {
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
  
  playerOrder.push(id);
  return playersObject[id];
}

// TODO: Refer to player usernames somehow, for testing?
function resetPlayers(playerOrder) {
  
  let newPlayers = {};
  playerOrder = []; //create new?

  Object.values(io.sockets.sockets).forEach((socket, i) => {
    let newAlias = "Player " + i; //(socket.id in players) ? players[socket.id].alias : "Player " + i;
    createPlayer(newPlayers, socket.id, newAlias, playerOrder);
  });
  return newPlayers; //return or set players
}

function newRound() {
  oldMap = currentMap;
  currentMap = terrain.createPlatformLayer();
  playerTurnIndex = 0;
  players = resetPlayers();
  io.emit("updatePlatformLayer",{
    new: currentMap,
    old: oldMap}
    );
  io.emit("clearScene");
  startRound(playerOrder);
}

function newTurn(timeout = 0, playerOrder) {
  // console.log("newTurn: " + playerOrder);
  io.emit("syncGamestate", players);
  setTimeout(function() {
    io.emit("nextPlayerTurn", nextPlayerAlias(playerOrder));
  }, timeout); //delay to sync allowedToEmit and bullet destroy
}

function startRound(playerOrder) {
  // console.log("startRound playerOrder: " + playerOrder);
  io.emit("currentPlayers", players);
  newTurn(2000, playerOrder);
  gameRunning = true;
  clientsReady = 0;
}

function calculateDmg(explosion, player) {
  
  let radius = explosion.radius + 32;
  let distance = Math.hypot(explosion.x, explosion.y, player.x, player.y);
  
  if (Math.hypot(32, 20) >= distance) { // 20?
    return explosion.dmg;
  } else if (distance <= radius) {
    return (explosion.dmg * (1 - distance / radius)).toFixed();
  } else {
    return 0;
  }
}

function getAlivePlayers(playerOrder) {
  
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

module.exports = { startGameServer, getAlivePlayers, startRoundIfAllReady, calculateDmg,
                    createPlayer };
