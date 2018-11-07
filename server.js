let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io').listen(server);

let players = {};

let WIDTH = 800;
let HEIGHT = 600;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: HEIGHT-50,
    playerId: socket.id,
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);

  });

});



server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
