var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
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
  this.load.image('otherPlayer', 'assets/tank-large.png');

}

function create() {
  var self = this;
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

  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();
}

function addPlayer(self, playerInfo) {

  self.tank = self.physics.add.image(playerInfo.x, playerInfo.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
/*
  self.ship.setDrag(100);
  self.ship.setAngularDrag(100);
  self.ship.setMaxVelocity(200);

*/

}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  if (playerInfo.team === 'blue') {
    otherPlayer.setTint(0x0000ff);
  } else {
    otherPlayer.setTint(0xff0000);
  }
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update() {

//    velocityFromAngle: function (angle, speed, vec2)
//      this.player.body.velocity.x = 200;


if (this.tank) {
    if (this.cursors.left.isDown) {
        this.tank.body.velocity.x = -150;
    } else if (this.cursors.right.isDown) {
        this.tank.body.velocity.x = 150;
    } else {
        this.tank.body.velocity.x = 0;
    }
  
    if (this.cursors.up.isDown) {
      //Set angle
    } else {
      this.tank.setAcceleration(0);
    }

    // emit player movement
    var x = this.tank.x;
    var y = this.tank.y;
    var r = this.tank.rotation;
    if (this.tank.oldPosition && (x !== this.tank.oldPosition.x || y !== this.tank.oldPosition.y || r !== this.tank.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.tank.x, y: this.tank.y, rotation: this.tank.rotation });
    }
     
    // save old position data
    this.tank.oldPosition = {
      x: this.tank.x,
      y: this.tank.y,
      rotation: this.tank.rotation
    };
  
    this.physics.world.wrap(this.tank, 5);
  }



}
