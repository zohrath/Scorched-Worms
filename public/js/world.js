function createWorld(self) {
  // createBackground(self);
  //createBullets(self);
  createTerrain(self);
  createPowerText(self);
  createTurnText(self);
  // self.physics.world.setBoundsCollision(true, true, false, true);
  self.matter.world.setBounds(left = true, right = true);
}

function createBackground(self) {
  self.terrain = self.add.sprite(512, 384, "background");
}

/*function createBullets(self) {
  self.bullets = self.physics.add.group({
    classType: Bullet,
    runChildUpdate: true
  });
}*/


function createTerrain(self) {
  //self.terrain = self.matter.add.staticGroup();
  //self.terrain.create(512, 753, "ground");
  //console.log(self.terrain);
  //self.terrain = self.matter.add.image(512, 753, "ground", null, { isStatic: true });
  
  self.terrain = self.make.tilemap({ key: 'map' });
  var tileset = self.terrain.addTilesetImage('scorchedworms', 'swImg');
  var backgroundlayer = self.terrain.createStaticLayer('bluesky', tileset, 0, 0).setScale(1);
  var platformlayer = self.terrain.createStaticLayer('map', tileset, 0, 0).setScale(1);

  platformlayer.setCollisionByProperty({ collides: true });
  self.matter.world.convertTilemapLayer(platformlayer);
  // self.matter.world.createDebugGraphic();

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
  
