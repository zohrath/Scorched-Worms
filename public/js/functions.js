function explodeBullet(bullet, object) {
  if (object.hasOwnProperty("playerId")) {
    bullet.hide();
    socket.emit("playerHit", object.playerId);
  }
  bullet.hide();
}

function createTank(self, playerInfo) {
  console.log("Adding player!");
  let tank = self.add.sprite(0, 0, "tank");
  let turret = self.add.sprite(0, -7, "turret");
  turret.setOrigin(0, 0.5);
  let tankContainer = self.add.container(playerInfo.x, playerInfo.y, [tank]);
  tankContainer.add(turret);
  //tankContainer.add(tank); TODO?
  tankContainer.setSize(64, 40);

  self.physics.world.enable(tankContainer);
  tankContainer.body.setBounce(0.3).setCollideWorldBounds(true);
  tankContainer.body.setMaxVelocity(300).setDragX(300);
  tankContainer.turretRotation = 0;
  self.physics.add.collider(tankContainer, self.terrain);
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

function rotateTurret(tank, newAngle) {
  tank.list[1].setRotation(newAngle);
}

function addPlayer(self, playerInfo) {
  createEmitter(self);
  self.playerContainer = createTank(self, playerInfo);
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

function movePlayer(self, time, delta) {
  if (self.cursors.left.isDown) {
    self.playerContainer.body.setAccelerationX(-500);
  } else if (self.cursors.right.isDown) {
    self.playerContainer.body.setAccelerationX(500);
  } else {
    self.playerContainer.body.setAccelerationX(0);
  }
  if (self.cursors.up.isDown && self.playerContainer.body.touching.down) {
    self.playerContainer.body.velocity.y = -100;
  } else if (self.cursors.down.isDown) {
    self.turretInContainer.rotation--;
  }
  // The if statement below this is never true. Something is wrong with keyX.
  if (keyX.isdown && self.playerContainer.body.touching.down) {
    self.playerContainer.body.velocity.y = -100;
  }

  // SPACE
  if (self.cursors.space.isDown) {
    self.spaceDown = true;
    power = (power + Math.floor(delta / 2)) % 1000;
    self.powerText.setText("Power: " + power);
  } else if (self.cursors.space.isUp) {
    if (self.spaceDown && time > self.nextTic) {
      self.nextTic = time + 500;
      shotInfo = {
        power: power,
        angle: self.turretInContainer.rotation
      };
      socket.emit("bulletFired", shotInfo);

      self.spaceDown = false;
      power = 0;
    }
  }

  // emit player movement
  if (self.playerContainer.oldPosition) {
    if (
      self.playerContainer.x !== self.playerContainer.oldPosition.x ||
      self.playerContainer.y !== self.playerContainer.oldPosition.y ||
      self.playerContainer.rotation !==
        self.playerContainer.oldPosition.rotation
    ) {
      socket.emit("playerMovement", {
        x: self.playerContainer.x,
        y: self.playerContainer.y,
        rotation: self.playerContainer.rotation
      });
    }

    if (
      self.turretInContainer.rotation !==
      self.playerContainer.oldPosition.turretRotation
    ) {
      socket.emit("toOtherClients", {
        event: "moveTurret",
        turretRotation: self.playerContainer.oldPosition.turretRotation
      });
    }
  }
}
