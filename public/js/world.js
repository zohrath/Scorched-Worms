function createWorld(self) {
  createBackground(self);
  createBullets(self);
  createTerrain(self);
  createPowerText(self);
  createTurnText(self);
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

function createTurnText(self) {
    self.turnText = self.add.text(16, 64, "Turn: ", {
      fontSize: "32px",
      fill: "#999"
    });
  }

function createCenterText(self,text){
  self.winText = self.add.text((game.canvas.width) * .5, ( game.canvas.height) * .5, text, {
    align: "center",
    fontSize: "64px",
    fill: "#999",
    boundsAlignH: "center", // bounds center align horizontally
    boundsAlignV: "middle" 
  }
  )
  self.winText.setOrigin(0.5,0.5);
  return self.winText;
}
  
