var config = {
  type: Phaser.AUTO,
  parent: "ScorchedWorms",
  width: 1024,
  height: 768,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 1000 }
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
var player;
var playerContainer;
var tank;
var physicsContainer;

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
    Object.values(players).forEach(value => {
      value.playerId === socket.id
        ? addPlayer(self, value)
        : addOtherPlayer(self, value);
    });
  });

  socket.on("newPlayer", function(playerInfo) {
    console.log("Activating newplayer");
    addOtherPlayer(self, playerInfo);
  });

  socket.on("playerMoved", function(playerInfo) {
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
    console.log("Adding player!")
    self.tank = self.add.sprite(0, 0, 'tank');
    self.turret = self.add.sprite(20, -3, 'turret');
    playerContainer = self.add.container(playerInfo.x, playerInfo.y, [self.tank]);    
    playerContainer.add(self.turret);
    playerContainer.add(self.tank);
    playerContainer.setSize(64,60);

    self.physics.world.enable(playerContainer);
    playerContainer.body.setBounce(0.3).setCollideWorldBounds(true);
    
    console.log(playerContainer);
  
    
    
    
    self.physics.add.collider(playerContainer, platforms);
  }
}

function fireBullet() {
  tank.body;
}

function addOtherPlayer(self, playerInfo) {
  console.log("Adding another player!")
  const otherPlayer = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, "tank")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40);
  self.physics.add.collider(otherPlayer, platforms);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update() {
  if (playerContainer) {
    if (cursors.left.isDown) {
      playerContainer.body.velocity.x = -150;
    } else if (cursors.right.isDown) {
      playerContainer.body.velocity.x = 150;
    } else {
      playerContainer.body.velocity.x = 0;
    }
    if (cursors.up.isDown && playerContainer.body.touching.down) {
      playerContainer.body.velocity.y = -200;
    } else {
      //playerContainer.setAcceleration(0);
    }
    // emit playerContainer movement
    if (
      playerContainer.oldPosition &&
      (playerContainer.x !== playerContainer.oldPosition.x ||
        playerContainer.y !== playerContainer.oldPosition.y ||
        playerContainer.r !== playerContainer.oldPosition.rotation)
    ) {
      socket.emit("playerContainerMovement", {
        x: playerContainer.x,
        y: playerContainer.y,
        rotation: playerContainer.rotation
      });
    }
    // save old position data
    playerContainer.oldPosition = {
      x: playerContainer.x,
      y: playerContainer.y,
      rotation: playerContainer.rotation
    };
    this.physics.world.wrap(playerContainer, 5);
  }
}
