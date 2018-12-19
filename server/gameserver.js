let socketio = require("socket.io");
let players = {};
// IDs, TODO: randomize
let playerTurnIndex = 0; //flag for whose turn it is
let io;
let clientsReady = 0;
let gameRunning = false;
let currentMap;

let terrain = require("./terrain.js");


let TILESIZE = 16;
let WIDTH = 1024;
let HEIGHT = 768;

// Just to get initial test running, consider pruning
var userName;
var clients = {};

function startGameServer(server) {
  let playerOrder = [];

  io = socketio.listen(server);

  io.sockets.on("connection", socket => {
    if (gameRunning) {
      socket.emit("currentPlayers", players);
      syncGamestateEmit(socket,players,currentMap);
    } else {
      // create a new player and add it to our players object
      createPlayer(
        players,
        socket.id,
        "Player " + playerOrder.length,
        playerOrder
      );
    }

    socket.on("username", user => {
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
    socket.on("playerMovement", movementData => {
      if (players[socket.id]) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        // emit a message to all players about the player that moved
        socket.broadcast.emit("playerMoved", players[socket.id]);
      }
    });

    socket.on("isPlayerHit", explosionInfo => {
      tilesToRemove = terrain.tilesHit(explosionInfo,16);
      terrain.updatePlatformLayer(currentMap,tilesToRemove);
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
        newRound(playerOrder);
      }
    });

    socket.on("bulletFired", inputInfo => {
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

    socket.on("toOtherClients", data => {
      var eventname = data["event"];
      delete data["event"];
      data["playerId"] = socket.id;
      socket.broadcast.emit(eventname, data);
    });

    socket.on("finishedTurn", () => {
      newTurn(playerOrder);
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
  } while (playerSocketID === "DEAD");

  //console.log(playerSocketID)
  // TODO check that players ONLY have valid players
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
    y: HEIGHT/2,
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

function newRound(playerOrder) {
  currentMap = terrain.createPlatformLayer(WIDTH,HEIGHT,TILESIZE);
  playerTurnIndex = 0;
  players = resetPlayers();
  io.emit("updatePlatformLayer",currentMap);
  io.emit("clearScene");
  startRound(playerOrder);
}

function newTurn(playerOrder, timeout=2000) {
  syncGamestateEmit(io,players,currentMap);
  setTimeout(function() {
    io.emit("nextPlayerTurn", nextPlayerAlias(playerOrder));
  }, timeout); //delay to sync allowedToEmit and bullet destroy
}

function syncGamestateEmit(sendTo,players,map){
  sendTo.emit("syncGamestate", {    
    playerInfo: players,
    mapInfo: map
  });
}

function startRound(playerOrder) {
  // console.log("startRound playerOrder: " + playerOrder);
  io.emit("currentPlayers", players);
  newTurn(playerOrder);
  gameRunning = true;
  clientsReady = 0;
}

function calculateDmg(explosion, player) {
  let radius = explosion.radius + 32;
  let distance = Math.hypot(explosion.x-player.x, explosion.y - player.y);
  let dmg = 0;

  if (Math.hypot(32, 20) >= distance) {
    // 20?
    dmg = explosion.dmg;
  } else if (distance <= radius) {
    dmg = (explosion.dmg * (1 - distance / radius)).toFixed();
  }
  console.log(dmg, distance / radius, distance, radius)
  return dmg;
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

module.exports = {
  startGameServer,
  getAlivePlayers,
  startRoundIfAllReady,
  calculateDmg,
  createPlayer
};
