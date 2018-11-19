
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
  this.load.image("tank_right", "assets/tank_right.png");
  this.load.image("tank_left", "assets/tank_left.png");
  this.load.image("tank", "assets/tank_right.png");
  this.load.image("background", "assets/background_vulcano.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("turret", "assets/turret.png");
  this.load.image('smoke', 'assets/smoke-puff.png');
}

function create() {
  this.nextTic = 0;
  var self = this;
  this.background = this.add.sprite(512, 384, "background");
  this.bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
  platforms = this.physics.add.staticGroup();
  platforms.create(512, 753, "ground");

  cursors = this.input.keyboard.createCursorKeys();

  socket = io();
  this.otherPlayers = this.physics.add.group();
  socket.on("currentPlayers", function(players) {
    Object.values(players).forEach(value => {
      if (value.playerId === socket.id){
        addPlayer(self, value)
      } else {
        addOtherPlayer(self, value);
      }
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
  
}

function createTank(self, playerInfo) {
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


  self.particles = self.add.particles('smoke');
  self.emitter = self.particles.createEmitter({
      on: false,
      active: true,
      speed: 100,
      scale: { start: 0.15, end: 0 },
      blendMode: 'ADD'
  });
  self.physics.add.collider(playerContainer, platforms);
  return playerContainer;
}

function addPlayer(self, playerInfo) {
  var player = createTank(self, playerInfo);
  console.log(player);
}

function fireBullet(self,x,y,angle,speed) {
    var bullet = self.bullets.get();
    if (bullet)
    {
        bullet.fire(x, y, angle,speed);
    }

}

function addOtherPlayer(self, playerInfo) {
  otherPlayer = createTank(self, playerInfo);
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

    if(cursors.space.isDown){
      console.log("SPACE NERE!");
      if(time > this.nextTic) {
        console.log(time);
        this.nextTic = time + 1000;
        fireBullet(this,this.tank.x,this.tank.y,30,800);
      }
    }
    // emit player movement
    if (
      playerContainer.oldPosition &&
      (playerContainer.x !== playerContainer.oldPosition.x ||
        playerContainer.y !== playerContainer.oldPosition.y ||
        playerContainer.r !== playerContainer.oldPosition.rotation)
    ) {
      socket.emit("playerMovement", {
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
    if (playerContainer.body.velocity.x > 0){
      this.emitter.startFollow(playerContainer, -30, 8);
      this.emitter.on = true;
    }
    else if(playerContainer.body.velocity.x < 0){
      this.emitter.startFollow(playerContainer, 30, 8);
      this.emitter.on = true;
    }
    else{
      this.emitter.on = false;
    }
    this.physics.world.wrap(playerContainer, 5);
  }
}
