let socketio = require("socket.io");
let players = {};
let playerOrder = [];// IDs, TODO: randomize 
let playerTurnIndex = 0; //flag for whose turn it is
let io;

let WIDTH = 800;
let HEIGHT = 600;

function startGameServer(server) {
  io = socketio.listen(server);

  io.sockets.on("connection", function(socket) {
    console.log("a user connected");
    // create a new player and add it to our players object
    players[socket.id] = {
      rotation: 0,
      x: Math.floor(Math.random() * 700) + 50,
      y: HEIGHT - 50,
      playerId: socket.id,
      playerTurn: playerOrder.length == 0 //TODO randomize for 1 player to be true
    };
    // add id to playerOrder
    playerOrder.push(socket.id);
    
    // send the players object to the new player
    socket.emit("currentPlayers", players);
    // update all other players of the new player
    socket.broadcast.emit("newPlayer", players[socket.id]);
    socket.emit("nextPlayerTurn",playerTurnIndex);

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
      if (players[socket.id]){
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit("playerMoved", players[socket.id]);
      }
    });
    socket.on("playerHit",function(socketId){
      io.emit("removePlayer", socketId);
      // if next turn's players is dead, skip
      // TODO: handle multi kill (recursive?)
      // let nextPlayerTurnIndex = getNextPlayerTurnIndex();
      // if(playerOrder[nextPlayerTurnIndex] == socketId){
      //     playerTurnIndex = getNextPlayerTurnIndex(offset=2);
      // }
      removeFromPlayerOrder(socketId);
      players[socketId].active = false;
      //io.emit("nextPlayerTurn", playerTurnIndex); //TODO: correct?

    });
    socket.on('bulletFired', function(inputInfo){
      player = players[socket.id];
  
      bulletInfo ={
        x: player.x,
        y: player.y,
        power: inputInfo.power,
        angle: inputInfo.angle
      }
  
      io.emit('fireBullet',bulletInfo);
    });
    socket.on('toOtherClients', function(data){
      var eventname = data["event"];
      delete data["event"];
      data["playerId"] = socket.id
      socket.broadcast.emit(eventname, data);
    });

    socket.on("finishedTurn", function(){
      playerTurnIndex = getNextPlayerTurnIndex();
      let nextPlayer = playerOrder[playerTurnIndex];
      let nextPlayerSocket = io.sockets.sockets[nextPlayer];
      nextPlayerSocket.emit("startTurn");
      io.emit("nextPlayerTurn", playerTurnIndex);
    });

  });
}

function removeFromPlayerOrder(targetID){
  playerOrder.forEach( function(id, i){
    if(targetID == id){
      playerOrder.splice(i, 1); //remove from index i and 1 element 
    }
  });
}

function getNextPlayerTurnIndex(offset=1){
  return ((playerTurnIndex + offset) % (playerOrder.length)) ;
}

module.exports = { startGameServer, players, WIDTH, HEIGHT};
