function createWorld(scene) {
  // createBackground(scene);
  createBullets(scene);
  createTerrain(scene);
  createPowerText(scene);
  createTurnText(scene);
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


function createTerrain(scene) { 
  scene.terrain = scene.make.tilemap({ key: 'map' });
  var tileset = scene.terrain.addTilesetImage('scorchedworms', 'swImg');
  var backgroundlayer = scene.terrain.createStaticLayer('bluesky', tileset, 0, 0).setScale(1);
  var platformlayer = scene.terrain.createStaticLayer('map', tileset, 0, 0).setScale(1);

  platformlayer.setCollisionByProperty({ collides: true });
  scene.matter.world.convertTilemapLayer(platformlayer);
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
  
