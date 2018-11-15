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
      playerId: socket.id
    };
    // send the players object to the new player
    socket.emit("currentPlayers", players);
    // update all other players of the new player
    socket.broadcast.emit("newPlayer", players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on("disconnect", function() {
      console.log("user disconnected");
      // remove this player from our players object
      delete players[socket.id];
      // emit a message to all players to remove this player
      io.emit("disconnect", socket.id);
    });

    // when a player moves, update the player data
    socket.on("playerMovement", function(movementData) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].rotation = movementData.rotation;
      // emit a message to all players about the player that moved
      socket.broadcast.emit("playerMoved", players[socket.id]);
    });
  });
}

module.exports = { startGameServer, players, WIDTH, HEIGHT};
