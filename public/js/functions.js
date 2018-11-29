function explodeBullet(bullet, object) {
  if (object.hasOwnProperty("playerId")) {
    bullet.hide();
    socket.emit("playerHit", object.playerId);
  }
  bullet.bulletParticles.destroy();
  bullet.hide();
}

function createTank(self, playerInfo) {
  color = "#fff" //white
  let tankContainer = new Player(self, 'tank', 'turret', playerInfo, color);
  return tankContainer;
}

function createBulletEmitter(scene, self) {
  self.bulletParticles = scene.add.particles("green");
  self.bulletEmitter = self.bulletParticles.createEmitter({
    on: false,
    active: true,
    speed: 50,
    scale: { start: 0.3, end: 0},
    blendMode: "ADD"
  });
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
  self.isMyTurn = playerInfo.playerTurn;
  self.alias = playerInfo.alias
  let color = "#00ff00";
  self.playerContainer = createTank(self, playerInfo, color);
}

function fireBullet(self, x, y, angle, power) {
  let bullet = self.bullets.get();
  if (bullet) {
    bullet.fire(x, y, angle, power);
  }
}

function addOtherPlayer(self, playerInfo) {
  let color = "#ff0000";
  otherPlayer = createTank(self, playerInfo, color);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function movePlayer(self, time, delta) {

  if (self.cursors.left.isDown) {
    self.playerContainer.setVelocity(-10,0);
  } else if (self.cursors.right.isDown) {
    self.playerContainer.setVelocity(10,0);
  } else {
    self.playerContainer.setVelocityX(0);
  }
  if (self.cursors.up.isDown && self.playerContainer.body.touching.down) {
    self.playerContainer.body.velocity.y = -100;
  } else if (self.cursors.down.isDown) {
    //self.turretInContainer.rotation--;
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
        angle: self.playerContainer.getWeaponAngle()
      };
      socket.emit("bulletFired", shotInfo);
      socket.emit("finishedTurn"); // TODO: after bullet died, or smth else
      self.isMyTurn = false;
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
      self.playerContainer.getWeaponAngle() !==
      self.playerContainer.oldPosition.turretRotation
    ) {
      socket.emit("toOtherClients", {
        event: "moveTurret",
        turretRotation: self.playerContainer.oldPosition.turretRotation
      });
    }
  }
}
