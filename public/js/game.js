var config = {
  type: Phaser.AUTO,
  parent: 'ScorchedWorms',
  width: 1024,
  height: 768,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 100 }
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

var TankGame = function (game) {
    this.tank = null;
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
  platforms = this.physics.add.staticGroup();
  platforms = this.add.group();
  platforms.enableBody = true;
  this.background = this.add.sprite(512, 384, 'background');

  platforms.create(512, 400, 'ground');
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
  this.tank = this.physics.add.sprite(200, 200, 'tank');
  this.physics.add.collider(this.tank, platforms);
  //self.physics.arcade.enable(this.tank);
  //this.turret = this.add.sprite(this.tank.x + 30, this.tank.y + 14, 'turret');
  // this.fireButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  // this.fireButton.onDown.add(this.fireBullet, this);
};

function fireBullet() {
  this.tank.body

};

function addPlayer(self, playerInfo) {
  self.tank = this.add.sprite(playerInfo.x, playerInfo.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  //self.tank = self.physics.add.image(playerInfo.x, playerInfo.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(53, 40);


};

function update() {
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

    // // emit player movement
    // var x = this.tank.x;
    // var y = this.tank.y;
    // var r = this.tank.rotation;
    // if (this.tank.oldPosition && (x !== this.tank.oldPosition.x || y !== this.tank.oldPosition.y || r !== this.tank.oldPosition.rotation)) {
    //   this.socket.emit('playerMovement', { x: this.tank.x, y: this.tank.y, rotation: this.tank.rotation });
    // }
     
    // // save old position data
    // this.tank.oldPosition = {
    //   x: this.tank.x,
    //   y: this.tank.y,
    //   rotation: this.tank.rotation
    // };
  
    this.physics.world.wrap(this.tank, 5);
  }
};
