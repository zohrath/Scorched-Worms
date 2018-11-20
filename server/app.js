let socketio = require("socket.io");
let players = {};
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
      active: true // not used, remove?
    };
    // send the players object to the new player
    socket.emit("currentPlayers", players);
    // update all other players of the new player
    socket.broadcast.emit("newPlayer", players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on("disconnect", function() {
      console.log("user disconnected");
      
      io.emit("removePlayer", socket.id);
      // remove this player from our players object
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
      players[socketId].active = false;
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
  });
}


module.exports = { startGameServer, players, WIDTH, HEIGHT};
