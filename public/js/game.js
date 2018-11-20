let config = {
  type: Phaser.AUTO,
  parent: "ScorchedWorms",
  width: 1024,
  height: 768,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
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
let keyX;
var player;
var playerContainer;
var tank;
var physicsContainer;
let powerText;
let power = 0;
let angle = 0;

function preload() {
  this.load.image("tank_right", "assets/tank_right.png");
  this.load.image("tank_left", "assets/tank_left.png");
  this.load.image("tank", "assets/tank_right.png");
  this.load.image("background", "assets/background_vulcano.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("turret", "assets/turret.png");
  this.load.image("smoke", "assets/smoke-puff.png");
}

function create() {


  this.nextTic = 0;
  let self = this;
  this.background = this.add.sprite(512, 384, "background");
  this.bullets = this.physics.add.group({
    classType: Bullet,
    runChildUpdate: true
  });
  platforms = this.physics.add.staticGroup();
  platforms.create(512, 753, "ground");
  
  powerText = this.add.text(16, 16, "Power: 0", {
    fontSize: "32px",
    fill: "#999"
  });

  keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  cursors = this.input.keyboard.createCursorKeys();
  this.physics.world.setBoundsCollision(true, true, false, true);
  this.physics.world.on('worldbounds', function(){
    console.log("ASLDHAJKLSd")
  });

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
    addOtherPlayer(self, playerInfo);
  });

  socket.on("playerMoved", function(playerInfo) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
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
  
  this.input.on('pointermove', function (pointer) {
    let cursor = pointer;
    angle = Phaser.Math.Angle.Between(playerContainer.x, playerContainer.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY)
}, this);
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
  playerContainer.body.setMaxVelocity(300).setDragX(300);
  
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
};






function fireBullet(self, x, y, angle, speed) {
  let bullet = self.bullets.get();
  if (bullet) {
    bullet.fire(x, y, angle, speed);
  }
}

function addOtherPlayer(self, playerInfo) {
  otherPlayer = createTank(self, playerInfo);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update(time, delta) {
  if (playerContainer) {
    playerContainer.list[1].rotation = angle;
    if (cursors.left.isDown) {
      playerContainer.body.setAccelerationX(-500);
    } else if (cursors.right.isDown) {
      playerContainer.body.setAccelerationX(500);
    } else {
      playerContainer.body.setAccelerationX(0);
    }
    if (cursors.up.isDown) {
      playerContainer.body.velocity.y = -100;
      //console.log("Aim up");
    } else if (cursors.down.isDown) {
      console.log("Aim down");
    }
     // The if statement below this is never true. Something is wrong with keyX.
    if(keyX.isdown && playerContainer.body.touching.down) {
      console.log("Jumping?")
      playerContainer.body.velocity.y = -100;
    }

    // SPACE
    if (cursors.space.isDown) {
      this.spaceDown = true;
      power = (power + Math.floor(delta / 2)) % 800;
      powerText.setText("Power: " + power);
    } else if (cursors.space.isUp) {
      if (this.spaceDown && time > this.nextTic) {
        this.nextTic = time + 500;
        fireBullet(this, playerContainer.x, playerContainer.y, angle, power);
        this.spaceDown = false;
        power = 0;
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
    } else {
      this.emitter.on = false;
    }
  }
}
