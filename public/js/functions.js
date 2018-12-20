function explodeBullet(bullet, object) {
  bullet.explode(this);
  //bullet.hide();
}

function playerHit(player,explosion){
  let playerInfo = player.getPlayerInfo();
  let explosionInfo = explosion.getBasicInfo();
  socketEmit("playerHit", {
    playerInfo: playerInfo,
    explosionInfo: explosionInfo
  });
}

function createTank(scene, playerInfo, color) {
  let tank = new Player(scene, 'tank', 'turret', playerInfo, color);
  return tank;
}


function createBulletEmitter(scene, bullet) {
  bullet.bulletParticles = scene.add.particles("green");
  bullet.bulletEmitter = bullet.bulletParticles.createEmitter({
    on: true,
    active: true,
    speed: 50,
    scale: { start: 0.3, end: 0},
    blendMode: "ADD"
  });
}

function createEmitter(scene) {
  scene.particles = scene.add.particles("smoke");
  scene.emitter = scene.particles.createEmitter({
    on: true,
    active: true,
    speed: 100,
    scale: { start: 0.15, end: 0 },
    blendMode: "ADD"
  });
}

function rotateTurret(tank, newAngle) {
  tank.list[1].setRotation(newAngle);
}

function addPlayer(scene, playerInfo) {
  createEmitter(scene);
  scene.isMyTurn = playerInfo.playerTurn;
  scene.alias = playerInfo.alias
  let color = "#00ff00";
  scene.playerContainer = createTank(scene, playerInfo, color);
}

function addOtherPlayer(scene, playerInfo) {
  let color = "#ff0000";
  otherPlayer = createTank(scene, playerInfo, color);
  otherPlayer.playerId = playerInfo.playerId;
  //scene.otherPlayers.add(otherPlayer);
  scene.otherPlayers[playerInfo.playerId] = otherPlayer;
}

function movePlayer(scene, time, delta) {
  if (scene.playerContainer.tank.body.velocity.x > 7) {
    scene.playerContainer.tank.body.setVelocityX(7);
  }
  else if(scene.playerContainer.tank.body.velocity.x < -7){
    scene.playerContainer.tank.setVelocityX(-7);
  }
  if (scene.cursors.left.isDown) {
    scene.playerContainer.thrustBack(0.5);
  } else if (scene.cursors.right.isDown) {
    scene.playerContainer.thrust(0.5);
  } else {
    //scene.playerContainer.setVelocity(0,0);
  }
  /*if (scene.cursors.up.isDown && scene.playerContainer.body.velocity.y > 0) {
    scene.playerContainer.thrustRight(-0.02);
  } else if (scene.cursors.down.isDown) {
    //scene.turretInContainer.rotation--;
  }*/
  // The if statement below this is never true. Something is wrong with keyX.
  if (keyX.isdown && scene.playerContainer.body.touching.down) {
    scene.playerContainer.body.velocity.y = -100;
  }

  // SPACE
  if (scene.cursors.space.isDown) {
    scene.spaceDown = true;
    power = (power + Math.floor(delta / 2)) % 1000;
    scene.powerText.setText("Power: " + power);
  } else if (scene.cursors.space.isUp) {
    if (scene.spaceDown && time > scene.nextTic) {
      scene.nextTic = time + 500;
      shotInfo = {
        power: power,
        angle: scene.playerContainer.getWeaponAngle()
      };
      scene.isMyTurn = false;
      scene.spaceDown = false;
      socketEmit("bulletFired", shotInfo);
      power = 0;
    }
  }
}

function socketEmit(emitName,data,force=false){
  if (allowedToEmit || force){
    socket.emit(emitName,data);
  }
}


function damagePlayer(explosion, player){
  //send expl player
  // with player hit
  let explosionInfo = explosion.getBasicInfo();
  let playerInfo = player.getPlayerInfo();
  if(playerInfo.playerId in scene.otherPlayers){
    socketEmit("playerHit",{explosion: explosionInfo,
  player: playerInfo});
  }
  //else if

  //emit explode bullet
}

function updatePlayerPosition(scene, playerInfo){

  currPlayer = scene.otherPlayers[playerInfo.playerId];
  
  if(typeof(currPlayer) !== 'undefined'){
    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
    currPlayer.syncSprites(playerInfo.angle);
  }
}

function updateAllPlayers(scene){
  Object.values(scene.otherPlayers).forEach(player => {
    player.syncSprites();
  });
  scene.playerContainer.syncSprites();
}

function diffValue(val1, val2, minimum){
  return (Math.abs(val1-val2) >=  minimum);
}