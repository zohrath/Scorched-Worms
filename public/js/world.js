function createWorld(scene) {
  // createBackground(scene);
  createBullets(scene);
  createTerrain(scene);
  createPowerText(scene);
  createTurnText(scene);
  createWeaponEmitter(scene, 5, 128);
  // scene.physics.world.setBoundsCollision(true, true, false, true);
  scene.matter.world.setBounds(left = true, right = true);
}

// function createBackground(scene) {
//   scene.terrain = scene.add.sprite(512, 384, "background");
// }


function createBullets(scene) {
  if(scene.hasOwnProperty("bullets")){
    scene.bullets.array.forEach(bullet => {
      if(bullet){
        bullet.destroyBullet();
      }
    });
  }
  scene.bullets = []; // defa update <-
  }


function removeTile(scene,x,y){
  platformLayer.removeTileAtWorldXY(x,y);

}

function addTile(type,x,y){
  platformLayer.putTileAtWorldXY(type,x,y);
}

function createTerrain(scene) { 
  scene.terrain = scene.make.tilemap({ key: 'map' });
  tileset = scene.terrain.addTilesetImage('scorchedworms', 'swImg');
  var backgroundlayer = scene.terrain.createStaticLayer('bluesky', tileset, 0, 0).setScale(1);
  platformLayer = scene.terrain.createDynamicLayer('map', tileset, 0, 0).setScale(1);
  platformLayer.setCollisionByProperty({ collides: true });
  scene.matter.world.convertTilemapLayer(platformLayer);
  // platformLayer.renderDebug();
  //scene.matter.world.createDebugGraphic();

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

function createWeaponEmitter(scene, radius, imgSize) {
  let weaponParticles = scene.add.particles("green");
  scene.weaponEmitter = weaponParticles.createEmitter({
    on: true,
    active: true,
    speed: 50,
    scale: { start: 0, end: 0.5}, //end to be radius/img.size
    blendMode: "ADD"
  });
  scene.weaponEmitter.size = 128;
}