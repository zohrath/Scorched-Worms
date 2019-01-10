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

function createTank(scene, playerInfo, color, isStatic) {
  let tank = new Player(scene, 'tank', 'turret', playerInfo, color, isStatic);
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

function createAudio(scene) {
  scene.music = scene.sound.add('soundtrack');
  scene.explosionSound = scene.sound.add('explosion');
  let musicConfig = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
  }
  scene.music.play(musicConfig);
}

function rotateTurret(tank, newAngle) {
  tank.list[1].setRotation(newAngle);
}

function addPlayer(scene, playerInfo) {
  createEmitter(scene);
  scene.isMyTurn = playerInfo.playerTurn;
  scene.alias = playerInfo.alias
  let color = "#00ff00";
  scene.playerContainer = createTank(scene, playerInfo, color, false);
}

function addOtherPlayer(scene, playerInfo) {
  let color = "#ff0000";
  otherPlayer = createTank(scene, playerInfo, color, true);
  otherPlayer.playerId = playerInfo.playerId;
  //scene.otherPlayers.add(otherPlayer);
  scene.otherPlayers[playerInfo.playerId] = otherPlayer;
}

function movePlayer(scene, time, delta) {
  if (scene.playerContainer.body.velocity.x > 7) {
    scene.playerContainer.body.setVelocityX(7);
  }
  else if(scene.playerContainer.body.velocity.x < -7){
    scene.playerContainer.setVelocityX(-7);
  }
  if (scene.cursors.left.isDown) {
    scene.playerContainer.fuel -= 1;
    setFuelText(scene)
    scene.playerContainer.thrustBack(0.5);
  } else if (scene.cursors.right.isDown) {
    scene.playerContainer.fuel -= 1;
    setFuelText(scene)
    scene.playerContainer.thrust(0.5);
  }


}

function setFuelText(scene){
  scene.fuelText.setText("Fuel: " + scene.playerContainer.fuel);
}

function playerShot(scene, time, delta){
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
        scene.powerText.setText("Power: " + power);
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
        otherPlayer.setAngle(playerInfo.angle);
      }
}

function createScoreBoardText(scoreboard){
  let string = "Rank  Score  Name";
  scoreboard.some(function(player,i)  {
    let pos = i+1;
    string +="\n"+ (pos);
    if (pos==1) {
      string += "st"
    } else if (pos==2) {
      string += "nd"
    } else if(pos==3) {
      string += "rd"
    } else {
      string += "th"
    }
    scoreSpace = " ".repeat(8-player.score.toString().length);
    let playerName = player.alias;
    if (playerName.length > 8){
      playerName = playerName.substring(0,8) + "...";
    }
    string += scoreSpace + player.score+ "  " + playerName;
    return i>4;
  });
  return string;
  
}

function diffValue(val1, val2, minimum){
  return (Math.abs(val1-val2) >=  minimum);
}