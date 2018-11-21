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
let turretInContainer;
let powerText;
let power = 0;
let mouseAngle = 0;

function preload() {
  this.load.image("tank_right", "assets/tank_right.png");
  this.load.image("tank_left", "assets/tank_left.png");
  this.load.image("tank", "assets/tank_right.png");
  this.load.image("background", "assets/background_vulcano.png");
  this.load.image("ground", "assets/ground.png");
  this.load.image("turret", "assets/turret.png");
  this.load.image("smoke", "assets/smoke-puff.png");
  this.load.image("bullet", "assets/bullet.png");
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

  socket = io();
  this.otherPlayers = this.physics.add.group();

  socket.on("currentPlayers", function(players) {
    Object.values(players).forEach(value => {
      if (value.playerId === socket.id) {
        addPlayer(self, value);
        turretInContainer = playerContainer.list[1]; // Is this the position of the turret always?
      } else {
        addOtherPlayer(self, value);
      }
    });
  });

  //COLLIDERS
  this.physics.add.collider(this.bullets, platforms, explodeBullet, null, self);
  this.physics.add.collider(
    this.bullets,
    this.otherPlayers,
    explodeBullet,
    null,
    self
  );

  socket.on("newPlayer", function(playerInfo) {
    addOtherPlayer(self, playerInfo);
  });

  socket.on("playerMoved", playerInfo => {
    self.otherPlayers.getChildren().forEach(otherPlayer => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  socket.on("removePlayer", function(playerId) {
    if (socket.id == playerId) {
      playerContainer.setActive(false);
      playerContainer.setVisible(false);
      playerContainer.destroy();
    }
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });


  socket.on("fireBullet", function(bulletInfo) {
    fireBullet(
      self,
      bulletInfo.x,
      bulletInfo.y,
      bulletInfo.angle,
      bulletInfo.power
    );
  });

  socket.on("moveTurret", function(turretInfo) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (turretInfo.playerId === otherPlayer.playerId) {
        rotateTurret(otherPlayer,turretInfo.turretRotation);
      }
    });
  });

  this.input.on(
    "pointermove",
    function(pointer) {
      let cursor = pointer;
      if (typeof playerContainer == "object") {
        mouseAngle = Phaser.Math.Angle.Between(
          playerContainer.x,
          playerContainer.y,
          cursor.x + this.cameras.main.scrollX,
          cursor.y + this.cameras.main.scrollY
        );
      }
    },
    this
  );
}

function createTank(self, playerInfo) {
  console.log("Adding player!")
  let tank = self.add.sprite(0, 0, 'tank');
  let turret = self.add.sprite(0, -7, 'turret');
  turret.setOrigin(0, 0.5);
  let tankContainer = self.add.container(playerInfo.x, playerInfo.y, [tank]);    
  tankContainer.add(turret);
  //tankContainer.add(tank); TODO?
  tankContainer.setSize(64, 40);

  self.physics.world.enable(tankContainer);
  tankContainer.body.setBounce(0.3).setCollideWorldBounds(true);
  tankContainer.body.setMaxVelocity(300).setDragX(300);
  tankContainer.turretRotation = 0;

  self.physics.add.collider(tankContainer, platforms);
  return tankContainer;
}

function createEmitter(self) {
  self.particles = self.add.particles("smoke");
  self.emitter = self.particles.createEmitter({
    on: false,
    active: true,
    speed: 100,
    scale: { start: 0.15, end: 0 },
    blendMode: "ADD"
  });
}

function rotateTurret(tank,newAngle){
  tank.list[1].setRotation(newAngle); 
}

function addPlayer(self, playerInfo) {
  createEmitter(self);
  playerContainer = createTank(self, playerInfo);
}

function fireBullet(self, x, y, angle, power) {
  let bullet = self.bullets.get();
  if (bullet) {
    bullet.fire(x, y, angle, power);
  }
}

function addOtherPlayer(self, playerInfo) {
  otherPlayer = createTank(self, playerInfo);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function update(time, delta) {
  if (typeof playerContainer !== "undefined" && playerContainer.active) {
    turretInContainer.rotation = mouseAngle;
    if (cursors.left.isDown) {
      playerContainer.body.setAccelerationX(-500);
    } else if (cursors.right.isDown) {
      playerContainer.body.setAccelerationX(500);
    } else {
      playerContainer.body.setAccelerationX(0);
    }
    if (cursors.up.isDown && playerContainer.body.touching.down) {
      playerContainer.body.velocity.y = -100;
    } else if (cursors.down.isDown) {
      turretInContainer.rotation--;
    }
    // The if statement below this is never true. Something is wrong with keyX.
    if (keyX.isdown && playerContainer.body.touching.down) {
      playerContainer.body.velocity.y = -100;
    }

    // SPACE
    if (cursors.space.isDown) {
      this.spaceDown = true;
      power = (power + Math.floor(delta / 2)) % 1000;
      powerText.setText("Power: " + power);
    } else if (cursors.space.isUp) {
      if (this.spaceDown && time > this.nextTic) {
        this.nextTic = time + 500;
        shotInfo = {
          power: power,
          angle: turretInContainer.rotation
        };
        socket.emit("bulletFired", shotInfo);

        this.spaceDown = false;
        power = 0;
      }
    }

    // emit player movement
    if (playerContainer.oldPosition) {
      if (
        playerContainer.x !== playerContainer.oldPosition.x ||
        playerContainer.y !== playerContainer.oldPosition.y ||
        playerContainer.rotation !== playerContainer.oldPosition.rotation
      ) {
        socket.emit("playerMovement", {
          x: playerContainer.x,
          y: playerContainer.y,
          rotation: playerContainer.rotation
        });
      }

      if (
        turretInContainer.rotation !== playerContainer.oldPosition.turretRotation
      ) {
        socket.emit("toOtherClients", {
          event: "moveTurret",
          turretRotation: playerContainer.oldPosition.turretRotation
        });
      }
    }
    // save old position data
    playerContainer.oldPosition = {
      x: playerContainer.x,
      y: playerContainer.y,
      rotation: playerContainer.rotation,
      turretRotation: turretInContainer.rotation
    };
    if (playerContainer.body.velocity.x > 0) {
      this.emitter.startFollow(playerContainer, -30, 8);
      playerContainer.list[0].flipX = false;
      this.emitter.on = true;
    } else if (playerContainer.body.velocity.x < 0) {
      this.emitter.startFollow(playerContainer, 30, 8);
      playerContainer.list[0].flipX = true;
      this.emitter.on = true;
    } else {
      this.emitter.on = false;
    }
  }
}

function explodeBullet(bullet, object) {
  if (object.hasOwnProperty("playerId")) {
    bullet.hide();
    socket.emit("playerHit", object.playerId);
  }
  bullet.hide();
}

function varExists(obj) {
  return obj.hasOwnProper !== "undefined";
}
