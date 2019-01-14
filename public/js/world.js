function createWorld(scene) {

  createBullets(scene);
  createBackground(scene);
  createTerrain(scene);
  createPowerText(scene);
  createFuelText(scene);
  createTurnText(scene);
  createWeaponEmitter(scene, 5, 128);
  createAnims(scene);
  // scene.physics.world.setBoundsCollision(true, true, false, true);
  scene.matter.world.setBounds((left = true), (right = true));
}

function createBackground(scene) {
  let rand = Math.floor(Math.random() * scene.backgroundImages.length);
  scene.background = scene.add.sprite(512, 384, scene.backgroundImages[rand]);
}

function createBullets(scene) {
  if (scene.hasOwnProperty("bullets")) {
    scene.bullets.array.forEach(bullet => {
      if (bullet) {
        bullet.destroyBullet();
      }
    });
  }
  scene.bullets = []; // defa update <-
}

function createMap(scene, mapMatrix){
  addTiles(scene,mapMatrix);
  platformLayer.physic = scene.matter.world.convertTilemapLayer(
    platformLayer.graphic
  );
}

function destroyMap(scene) {
  let tiles = platformLayer.graphic.getTilesWithin();
  tiles.forEach(tile =>{
      removeTile(scene, tile);
  });
}

function removeTile(scene, tile) {
  if (tile) {
    var layer = tile.tilemapLayer;
    if (typeof tile.physics.matterBody !== "undefined")
      tile.physics.matterBody.destroy();
    layer.removeTileAt(tile.x, tile.y);
  }
}

function addTiles(scene,tiles){
  let tilesMatrix = Object.values(tiles);
  let tileColArray;
  tilesMatrix.forEach(tileCol =>{
    tileColArray = Object.values(tileCol);
    tileColArray.forEach(tile =>{
      addTile(scene,tile.type,tile.x,tile.y);
    })

  });
  let firstTileCoords = Object.values(tilesMatrix[0])[0];
  let lastTileCoords = tileColArray[tileColArray.length-1];
  let firstTile = platformLayer.graphic.getTileAtWorldXY(firstTileCoords.x,firstTileCoords.y);
  let lastTile = platformLayer.graphic.getTileAtWorldXY(lastTileCoords.x, lastTileCoords.y);
  platformLayer.graphic.setCollisionBetween(firstTile.index, lastTile.index);
}

function addTile(scene, type, x, y) {
  return platformLayer.graphic.putTileAtWorldXY(type, x, y);
}

function createTerrain(scene) {
  scene.terrain = scene.make.tilemap({ key: "map" });
  tileset = scene.terrain.addTilesetImage("scorchedworms", "swImg");
  /*var backgroundlayer = scene.terrain
    .createStaticLayer("bluesky", tileset, 0, 0)
    .setScale(1);*/
  platformLayer.graphic = scene.terrain
    .createDynamicLayer("map", tileset, 0, 0)
    .setScale(1);
  platformLayer.graphic.setCollisionByProperty({ collides: true });
  platformLayer.physic = scene.matter.world.convertTilemapLayer(
    platformLayer.graphic
  );
  // platformLayer.renderDebug();
  //scene.matter.world.createDebugGraphic();
}

function createPowerText(scene) {
  scene.powerText = scene.add.text(16, 16, "Power: 0", {
    fontSize: "32px",
    fill: "#999"
  });
}

function createFuelText(scene){
  scene.fuelText = scene.add.text(16, 48, "Fuel: 0", {
    fontSize: "32px",
    fill: "#999"
  });

}

function createTurnText(scene) {
  scene.turnText = scene.add.text(16, 80, "Turn: ", {
    fontSize: "32px",
    fill: "#999"
  });
}

function updateCenterText(scene, text) {
  if(scene.highCenterText){
    scene.highCenterText.destroy()
    delete scene.highCenterText;
  }
  if(text && text.length > 0){
    scene.highCenterText = scene.add.text(
      game.canvas.width * 0.5,
      game.canvas.height * 0.3,
      text,
      {
        align: "center",
        fontSize: "64px",
        fill: "#000",
        boundsAlignH: "center", // bounds center align horizontally
        boundsAlignV: "middle"
      }
    );
    scene.highCenterText.setOrigin(0.5, 0.5);
    scene.highCenterText._visible = true;
  }
}

function updateLowCenterText(scene,text){
  if(scene.lowCenterText){
    scene.lowCenterText.destroy()
    delete scene.lowCenterText;
  }
  scene.lowCenterText = scene.add.text(
    game.canvas.width * 0.5,
    game.canvas.height * 0.4,
    text,
    {
      align: "center",
      fontSize: "64px",
      fill: "#000",
      boundsAlignH: "center", // bounds center align horizontally
      boundsAlignV: "middle"
    }
  );
  scene.lowCenterText.setOrigin(0.5, 0.5);

}

function createWeaponEmitter(scene, radius, imgSize) {
  let weaponParticles = scene.add.particles("green");
  scene.weaponEmitter = weaponParticles.createEmitter({
    on: false,
    active: false,
    speed: 50,
    scale: { start: 0, end: 0.5 }, //end to be radius/img.size
    blendMode: "ADD"
  });
  scene.weaponEmitter.size = 128;
}

function createAnims(scene) {
  scene.anims.create({
    key: "explosionKey128",
    frames: scene.anims.generateFrameNumbers("explosionSpriteSheet128", {
      start: 0,
      end: 15
    }),
    frameRate: 16,
    repeat: 0,
    hideOnComplete: true
  });
}
