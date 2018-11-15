var config = {
  type: Phaser.AUTO,
  parent: 'ScorchedWorms',
  width: 1024,
  height: 768,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 300 }
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
let tank;
let platforms;

var game = new Phaser.Game(1024, 768, Phaser.CANVAS, 'ScorchedWorms', {preload: preload, create: create, update: update});

var TankGame = function (game) {

    tank = null;
    this.turret = null;
    this.bullet = null;
    this.background = null;
    this.ground = null;

    this.power = 100;

};


function preload() {
  this.load.image('tank', 'assets/tank.png');
  this.load.image('background', 'assets/background_vulcano.png');
  this.load.image('ground', 'assets/ground.png');
  this.load.image('turret', 'assets/turret.png');
};

function create() {
  var self = this;
  this.background = this.add.sprite(512, 384, 'background');

  platforms = this.physics.add.staticGroup();
  platforms.create(512, 753, 'ground');

  cursors = this.input.keyboard.createCursorKeys();

  tank = this.physics.add.sprite(200, 200, 'tank');
  tank.setBounce(0.3);
  tank.setCollideWorldBounds(true);
  tank.body.setGravity(3);

  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
        console.log("add self")
      } else {
        addPlayer(self, players[id]);
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

  this.physics.add.collider(platforms, tank);


};

function fireBullet() {

  tank.body

};

function addPlayer(self, playerInfo) {
  //self.tank = this.add.sprite(playerInfo.x, playerInfo.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  //self.tank = self.physics.add.image(playerInfo.x, playerInfo.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    
};

function update() {
  if (tank) {
    if (cursors.left.isDown) {
      tank.body.velocity.x = -150;
      } else if (cursors.right.isDown) {
      tank.body.velocity.x = 150;
      } else {
      tank.body.velocity.x = 0;
      }
      if (cursors.up.isDown) {
      tank.body.velocity.y = -100;
      } else {
      tank.setAcceleration(0);
      }
      // emit player movement
      var x = tank.x;
    var y = tank.y;
    var r = tank.rotation;
    if (tank.oldPosition && (x !== tank.oldPosition.x || y !== tank.oldPosition.y || r !== tank.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: tank.x, y: tank.y, rotation: tank.rotation });
      }
      // save old position data
      tank.oldPosition = {
      x: tank.x,
          y: tank.y,
          rotation: tank.rotation
    };
    this.physics.world.wrap(tank, 5);
  }
};
