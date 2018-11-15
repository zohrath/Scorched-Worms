var config = {
  type: Phaser.AUTO,
  parent: "ScorchedWorms",
  width: 1024,
  height: 768,
  physics: {
    default: "arcade",
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

let game = new Phaser.Game(config);
let platforms;
let cursors;

function preload() {
  this.load.image("tank", "assets/tank.png");
  this.load.image("background", "assets/background_vulcano.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("turret", "assets/turret.png");
}

function create() {
  var self = this;
  this.background = this.add.sprite(512, 384, "background");

  platforms = this.physics.add.staticGroup();
  platforms.create(512, 753, "ground");

  cursors = this.input.keyboard.createCursorKeys();

  socket = io();
  this.otherPlayers = this.physics.add.group();
  socket.on("currentPlayers", function(players) {
    console.log(players, socket.id);
    Object.keys(players).forEach(function(id) {
      if (players[id].playerId === socket.id) {
        addPlayer(self, players[id]);
        console.log("add self");
      } else {
        addOtherPlayer(self, players[id]);
        console.log("add other");
      }
    });
  });

  socket.on("newPlayer", function(playerInfo) {
    console.log("Activating newplayer");
    addOtherPlayer(self, playerInfo);
  });

  socket.on("playerMoved", function(playerInfo){
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.roation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  socket.on("disconnect", function(playerId) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  
  function addPlayer(self, playerInfo) {
    self.tank = self.physics.add.sprite(playerInfo.x, playerInfo.y, "tank");
    self.tank.setBounce(0.3);
    self.tank.setCollideWorldBounds(true);
    self.tank.body.setGravity(3);
    self.physics.add.collider(self.tank, platforms);
  }
}



function fireBullet() {
  tank.body;
}

function addOtherPlayer(self, playerInfo) {
  const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  self.physics.add.collider(otherPlayer, platforms);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update() {
  if (this.tank) {
    if (cursors.left.isDown) {
      this.tank.body.velocity.x = -150;
    } else if (cursors.right.isDown) {
      this.tank.body.velocity.x = 150;
    } else {
      this.tank.body.velocity.x = 0;
    }
    if (cursors.up.isDown) {
      this.tank.body.velocity.y = -100;
    } else {
      this.tank.setAcceleration(0);
    }
    // emit player movement
    if (
      this.tank.oldPosition &&
      (this.tank.x !== this.tank.oldPosition.x ||
        this.tank.y !== this.tank.oldPosition.y ||
        this.tank.r !== this.tank.oldPosition.rotation)
    ) {
      socket.emit("playerMovement", {
        x: this.tank.x,
        y: this.tank.y,
        rotation: this.tank.rotation
      });
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
