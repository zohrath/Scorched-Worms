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
let powerText;
let power = 0;
let angle = 0;

function preload() {
  this.load.image("tank_right", "assets/tank_right.png");
  this.load.image("tank_left", "assets/tank_left.png");
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
  cursors = this.input.keyboard.createCursorKeys();
  this.physics.world.setBoundsCollision(true, true, false, true);
  this.physics.world.on('worldbounds', function(){
    console.log("ASLDHAJKLSd")
  });

  socket = io();
  this.otherPlayers = this.physics.add.group();
  socket.on("currentPlayers", function(players) {
    Object.keys(players).forEach(function(id) {
      if (players[id].playerId === socket.id) {
        addPlayer(self, players[id]);
 
      } else {
        addOtherPlayer(self, players[id]);
      }
    });
  });

  socket.on("newPlayer", function(playerInfo) {
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
    self.tank = self.physics.add.sprite(
      playerInfo.x,
      playerInfo.y,
      "tank_right"
    );
    self.tank.setBounce(0.3);
    self.tank.setCollideWorldBounds(true);
    self.physics.add.collider(self.tank, platforms);
    self.particles = self.add.particles("smoke");
    self.emitter = self.particles.createEmitter({
      on: false,
      active: true,
      speed: 100,
      scale: { start: 0.15, end: 0 },
      blendMode: "ADD"
    });
  }

this.input.on('pointermove', function (pointer) {
    let cursor = pointer;
    angle = Phaser.Math.Angle.Between(this.tank.x, this.tank.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY)
}, this);
}

function fireBullet(self, x, y, angle, speed) {
  let bullet = self.bullets.get();
  if (bullet) {
    bullet.fire(x, y, angle, speed);
  }
}

function addOtherPlayer(self, playerInfo) {
  const otherPlayer = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, "tank_right")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40);
  self.physics.add.collider(otherPlayer, platforms);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
function update(time, delta) {
  if (this.tank) {
    // MOVEMENT KEYS
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

    // SPACE
    if (cursors.space.isDown) {
      this.spaceDown = true;
      power = (power + Math.floor(delta / 2)) % 800;
      powerText.setText("Power: " + power);
    } else if (cursors.space.isUp) {
      if (this.spaceDown && time > this.nextTic) {
        this.nextTic = time + 500;
        fireBullet(this, this.tank.x, this.tank.y, angle, power);
        this.spaceDown = false;
        power = 0;
      }
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
    if (this.tank.body.velocity.x > 0) {
      this.emitter.startFollow(this.tank, -30, 8);
      this.emitter.on = true;
    } else if (this.tank.body.velocity.x < 0) {
      this.emitter.startFollow(this.tank, 30, 8);
      this.emitter.on = true;
    } else {
      this.emitter.on = false;
    }
  }
}
