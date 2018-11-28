function createWorld(scene) {
  createBackground(scene);
  createBullets(scene);
  createTerrain(scene);
  createPowerText(scene);
  createTurnText(scene);
  scene.physics.world.setBoundsCollision(true, true, false, true);
}

function createBackground(scene) {
  scene.terrain = scene.add.sprite(512, 384, "background");
}

function createBullets(scene) {
  scene.bullets = scene.physics.add.group({
    classType: Bullet,
    runChildUpdate: true
  });
}

function createTerrain(scene) {
  scene.terrain = scene.physics.add.staticGroup();
  scene.terrain.create(512, 753, "ground");
}
function createPowerText(scene) {
  scene.powerText = scene.add.text(16, 16, "Power: 0", {
    fontSize: "32px",
    fill: "#999"
  });
}

function createTurnText(scene) {
    scene.turnText = scene.add.text(16, 64, "Turn: ", {
      fontSize: "32px",
      fill: "#999"
    });
  }

function createCenterText(scene,text){
  scene.winText = scene.add.text((game.canvas.width) * .5, ( game.canvas.height) * .5, text, {
    align: "center",
    fontSize: "64px",
    fill: "#999",
    boundsAlignH: "center", // bounds center align horizontally
    boundsAlignV: "middle" 
  }
  )
  scene.winText.setOrigin(0.5,0.5);
  return scene.winText;
}
  
