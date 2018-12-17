let express = require("express");
let expressApp = express();
let server = require("http").Server(expressApp);
let gameServer = require("./server/gameserver.js");

expressApp.use(express.static(__dirname + "/public"));

expressApp.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

gameServer.startGameServer(server);

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});
