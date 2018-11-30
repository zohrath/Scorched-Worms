function explodeBullet(bullet, object) {
  bullet.explode(this);
  bullet.hide();
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
  let tankContainer = new Player(scene, 'tank', 'turret', playerInfo, color);
  return tankContainer;
}

function createEmitter(scene) {
  scene.particles = scene.add.particles("smoke");
  scene.emitter = scene.particles.createEmitter({
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
  scene.otherPlayers.add(otherPlayer);
}

function movePlayer(scene, time, delta) {

  if (scene.cursors.left.isDown) {
    scene.playerContainer.body.setAccelerationX(-500);
  } else if (scene.cursors.right.isDown) {
    scene.playerContainer.body.setAccelerationX(500);
  } else {
    scene.playerContainer.body.setAccelerationX(0);
  }
  if (scene.cursors.up.isDown && scene.playerContainer.body.touching.down) {
    scene.playerContainer.body.velocity.y = -100;
  } else if (scene.cursors.down.isDown) {
    scene.turretInContainer.rotation--;
  }
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