const State = require('./State');

let socketio = require("socket.io");
let players = {};
let playerTurnIndex = 0;
let io;
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
  var playerOrder = [];
  let state = new State(playerOrder);
  
  io = socketio.listen(server);

  io.sockets.on("connection", socket => {
    let clientAlias = socket.handshake.headers['alias'];

    let currentPlayer =  createPlayer(socket.id,clientAlias);
    players[socket.id] = currentPlayer;


    if (gameRunning) {
      socket.emit("currentPlayers", getPlayerCharacters());
      syncGamestateEmit(socket, getPlayerCharacters(), currentMap);
    } else {
      currentPlayer.character;
      emitReadyText(io);
      
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
      state.playerOrder.length,
      "in game."
    );
    // when a player disconnects, remove them from our players object
    socket.on("disconnect", () => {
      
      console.log(
        "a player disconnected",
        countConnectedPlayers(),
        "connected and",
        state.playerOrder.length,
        "in game."
      );

      io.emit("removePlayer", socket.id);
      // remove this player from our players object
      delete players[socket.id];
      playerIndex = playerOrder.indexOf(socket.id);
      if (playerIndex >= 0) {
        playerOrder.splice(playerIndex, 1);
      }
      socket.disconnect();
      if(countConnectedPlayers() < 2){
        gameRunning = false;
        io.emit("setReady",false);
      }
      if(isAllReady(playerOrder)){
        newRound(playerOrder);
      }
      else if(!gameRunning){
        emitReadyText(io)
      }
    });

    // when a player moves, update the player data
    socket.on("playerMovement", movementData => {
      if (players[socket.id]) {
        players[socket.id].character.x = movementData.x;
        players[socket.id].character.y = movementData.y;
        players[socket.id].character.angle = movementData.angle;
        // emit a message to all players about the player that moved
        socket.broadcast.emit("playerMoved", players[socket.id].character);
      }
    });

    socket.on("finishedTurn", explosionInfo => {
      tilesToRemove = terrain.tilesHit(explosionInfo,16);
      terrain.updatePlatformLayer(currentMap, tilesToRemove);
      //io.emit("removeTiles", tilesToRemove);
      Object.values(getPlayerCharacters()).forEach(currentPlayer => {
        let playerID = currentPlayer.playerId;
        let currDmg = calculateDmg(explosionInfo, currentPlayer);
        currentPlayer.hp -= currDmg;
        if (currentPlayer.hp <= 0) {
          removeFromPlayerOrder(playerID, playerOrder);
          io.emit("removePlayer", playerID);
          let point = socket.id == playerID ? -1 : 1;
          players[socket.id].score += point;
        }
      });
      
      let alivePlayers = getAlivePlayers(playerOrder);
      if (alivePlayers.length <= 1) {
        if (alivePlayers.length === 1) {
          io.emit("playerWon", players[alivePlayers[0]].alias);
        } else if (alivePlayers.length < 1) {
          io.emit("playerWon");
        }
        io.emit("showScoreboard",getScoreboard());
        newRound(playerOrder);
      }else {
        io.emit("updateHP", getPlayerCharacters());
        newTurn(playerOrder);
      }
    });

    socket.on("bulletFired", inputInfo => {
      let character = players[socket.id].character;

      bulletInfo = {
        x: character.x,
        y: character.y,
        power: inputInfo.power,
        angle: inputInfo.angle,
        id: character.id
      };

      io.emit("fireBullet", bulletInfo);
    });

    socket.on("toOtherClients", data => {
      var eventname = data["event"];
      delete data["event"];
      data["playerId"] = socket.id;
      socket.broadcast.emit(eventname, data);
    });

    socket.on("clientReady", () => {
      
      if (typeof players[socket.id] !== "undefined") {
        if (!players[socket.id].ready) {
          players[socket.id].ready = true;
        }

        if(isAllReady(playerOrder)){
          newRound(playerOrder);
        }
        else{
          emitReadyText(io);
        }
      }
    });

    //// FOR DEVELOPMENT
    socket.on("forceStart", () => {
      // newRound(playerOrder);
    });

    socket.on("sendAlias", data => {
      players[socket.id].alias = data.alias;
    });
  });
}

function countConnectedPlayers() {
  return Object.keys(io.sockets.sockets).length;
}

function isAllReady(playerOrder) {
  let clientsReady = getAmountReady();
  return (clientsReady === countConnectedPlayers() && clientsReady > 1)
}


function getNextPlayerSocketId(playerOrder, startingIndex) {
  for (let i = 0; i < playerOrder.length; i++) {
    const val = (i + startingIndex) % (playerOrder.length);
    const currentPlayer = playerOrder[val];
    if (currentPlayer !== "DEAD") {
      return [currentPlayer, val];
    }
  }
}

function getPlayerAlias(socketId, playersTest = getPlayerCharacters()) {
  try {
    return playersTest[socketId].alias;
  } catch (error) {
    
  }
}

//TODO compare nextPlayerAlias2 vs nextPlayerAlias
function nextPlayerAlias(playerOrder, startingIndex, playersTest = getPlayerCharacters()) {  
  // console.log("pO ",playerOrder);
  // console.log("playerOrder[startingIndex]", playerOrder[startingIndex]);
  // console.log("playersTest",playersTest);
  // console.log("playersTest[playerOrder[startingIndex]]",playersTest[playerOrder[startingIndex]]);
  if (playerOrder.length > 1) {
    var result = playersTest[playerOrder[startingIndex]];
    const id = getNextPlayerSocketId(playerOrder, startingIndex+1);
    result = id[0];
    playerTurnIndex = id[1];
  
  }
  return result;
}

function nextPlayerAlias2(playerOrder) {
  let playerSocketID;

  do {
    playerTurnIndex = getNextPlayerTurnIndex(1, playerOrder);
    playerSocketID = playerOrder[playerTurnIndex];
  } while (playerSocketID === "DEAD");

  if (players[playerSocketID].alias !== "undefined") {
    return players[playerSocketID].alias;
  } else {
    return;
  }
  return alias;
}

function removeFromPlayerOrder(targetID, playerOrder) {
  playerOrder.forEach(function(id, i) {
    if (targetID === id) {
      playerOrder[i] = "DEAD"; //remove from index i and 1 element
    }
  });
}

function createPlayer(id,alias){
  let player = {
    id: id,
    alias: alias,
    score: 0,
    character: null,
    ready: false,
  };
  return player;
}

function createPlayerCharacter(id, alias) {
  let x = Math.floor(Math.random() * 700) + 50;
  let y = getSpawnY(x) - 20;
  let playerCharacter = {
    id: id,
    alias: alias,
    angle: 0,
    x: x,
    y: y,
    playerId: id,
    playerTurn: false, //TODO randomize for 1 player to be true
    ready: false,
    hp: 10,
    turretAngle: 0
  };
  return playerCharacter;
}

// TODO: Refer to player usernames somehow, for testing?
function resetPlayers(playerOrder) {
  playerOrder.length = 0; //TODO verify 
  Object.entries(players).forEach(([id, playerData]) => {
    let newPlayer = createPlayerCharacter(id,playerData.alias)
    playerData.character = newPlayer;
    playerOrder.push(id);
  });
  playerOrder.sort(function() {  
    return 0.5 - Math.random()
  });
}

function newRound(playerOrder) {
  gameRunning = true;
  currentMap = terrain.createPlatformLayer(WIDTH,HEIGHT,TILESIZE);
  playerTurnIndex = 0;
  resetPlayers(playerOrder);
  io.emit("clearScene");
  //io.emit("updatePlatformLayer", currentMap);
  io.emit("currentPlayers", getPlayerCharacters());
  newTurn(playerOrder);
}

// TODO: Fix bug where playerOrder is not sent to nextPlayerAlias
// TODO: Should it b x or playerOrder(desync prob?)
function newTurn(playerOrder, timeout=2000) {
  syncGamestateEmit(io, getPlayerCharacters(), currentMap);
  let x = playerOrder;
  
  setTimeout(function() {
    let next = nextPlayerAlias(x, playerTurnIndex);
    let nextPlayer = players[next];
    if(nextPlayer){
      io.emit("nextPlayerTurn", nextPlayer.character);
    }
  }, timeout); //delay to sync allowedToEmit and bullet destroy
}

function calculateDmg(explosion, player) {
  let radius = explosion.radius + 32;
  let distance = Math.hypot(explosion.x - player.x, explosion.y - player.y);
  let dmg = 0;
  if (Math.hypot(32, 20) >= distance) {
    // 20?
    dmg =  explosion.dmg;
  } else if (distance <= radius) {
    dmg = (explosion.dmg * (1 - distance / radius)).toFixed();
  }
  
  //console.log("DMG", dmg, " D: ", distance, " R: ", radius);
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

function getScoreboard(){
  let playersScore = [];
  Object.values(players).forEach(function(player){
    playersScore.push({
      alias: player.alias,
      score: player.score
    });

  })
  let scoreBoard = sortByScore(playersScore);
  return scoreBoard;
}

function sortByScore(scoreBoard){
  scoreBoard.sort( (a,b) => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0)); 
  return scoreBoard;
}

function resetScene() {
  io.emit("resetScene");
}


function getPlayerCharacters(){
  let res = {};
  Object.entries(players).forEach(function([id, data]){
    if(data.character){
      
      res[id] = data.character;
    }
  })
  return res;
}

function emitReadyText(socket){
  socket.emit("isReady",{
    ready: getAmountReady(),
    total: countConnectedPlayers()
  });
}

function getAmountReady(){
  let result = 0;
  Object.values(players).forEach(function(player){
    if(player.ready){
      result++;
    }

  });
  return result;
}

function syncGamestateEmit(sendTo,players,map){
  sendTo.emit("syncGamestate", {    
    playerInfo: players,
    mapInfo: map
  });
}


function getSpawnY(x){
  let highestY = HEIGHT;
  let col; 
  let tile;
  for(let i = x-30 ;i <= x+30;i++){
    col = currentMap[i];
    if(col){
      let colArray = Object.values(col);
      tile = colArray[0];
      if(tile){
        if(tile.y < highestY){
        highestY = tile.y;
        }
      }
    }
  }
  return highestY;
}


module.exports = {
  startGameServer,
  getAlivePlayers,
  calculateDmg,
  createPlayerCharacter,
  getNextPlayerSocketId,
  nextPlayerAlias,
  getPlayerAlias,
  sortByScore,
};
