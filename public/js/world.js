function createWorld(self) {
  createBackground(self);
  createBullets(self);
  createTerrain(self);
  createPowerText(self);
  self.physics.world.setBoundsCollision(true, true, false, true);
}

function createBackground(self) {
  self.terrain = self.add.sprite(512, 384, "background");
}

function createBullets(self) {
  self.bullets = self.physics.add.group({
    classType: Bullet,
    runChildUpdate: true
  });
}

function createTerrain(self) {
  self.terrain = self.physics.add.staticGroup();
  self.terrain.create(512, 753, "ground");
}
function createPowerText(self) {
  self.powerText = self.add.text(16, 16, "Power: 0", {
    fontSize: "32px",
    fill: "#999"
  });
}
