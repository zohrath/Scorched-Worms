function createWorld(self) {
  createBackground(self);
  createBullets(self);
  createTerrain(self);
  createPowerText(self);
  createTurnText(self);
  //self.physics.world.setBoundsCollision(true, true, false, true);
}

function createBackground(self) {
  self.terrain = self.add.sprite(512, 384, "background");
}

function createBullets(self) {
  /* self.bullets = self.physics.add.group({
    classType: Bullet,
    runChildUpdate: true
  }); */
  console.log("createBullets are disabled.");
}

function createTerrain(self) {
  var shapes = self.cache.json.get('shapes');
  self.matter.world.setBounds(0, 0, game.config.width, game.config.height);
  
  var ground = self.matter.add.sprite(0, 0, 'sheet', 'groundhill', {shape: shapes.groundhill});
  ground.setPosition(0 + ground.centerOfMass.x, 560 + ground.centerOfMass.y);

  // self.terrain = self.physics.add.staticGroup();
  // self.terrain.create(512, 753, "ground");
}
function createPowerText(self) {
  self.powerText = self.add.text(16, 16, "Power: 0", {
    fontSize: "32px",
    fill: "#999"
  });
}

function createTurnText(self) {
    self.turnText = self.add.text(16, 64, "Turn: ", {
      fontSize: "32px",
      fill: "#999"
    });
  }
  
