var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1024,
  height: 768,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
    //render:?
  } 
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('tank', 'assets/tank-large.png');
  this.load.image('background', 'assets/background_vulcano.png');
  this.load.image('ground', 'assets/ground.png');
}

function create() {
  var self = this;
  this.platforms = this.add.group();
  this.platforms.enableBody = true;
  this.background = this.add.sprite(512, 384, 'background');
  this.ground = this.platforms.create(0, 0, 'ground');
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
        console.log("add self")
      } else {
        addOtherPlayers(self, players[id]);
        console.log("add other")

      }
    });
  });
  
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();
}

function addPlayer(self, playerInfo) {

  self.tank = self.physics.add.image(playerInfo.x, playerInfo.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(53, 40);


}

function update() {}
