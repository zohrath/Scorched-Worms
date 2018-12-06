function createSocketListners(scene) {
  createCurrentPlayersListener(scene);
  createNewPlayerListener(scene);
  createPlayerMovedListener(scene);
  createRemovePlayerListener(scene);
  createFireBulletListener(scene);
  createMoveTurretListener(scene);
  createStartTurn(scene);
  createNextPlayerTurn(scene);
  createClearScene(scene);
  createPlayerWon(scene);
}

function createCurrentPlayersListener(scene) {
  socket.on("currentPlayers", function(players) {
    Object.values(players).forEach(value => {
      if (value.playerId === socket.id) {
        addPlayer(scene, value);
        scene.ready = true;
      } else {
        addOtherPlayer(scene, value);
      }
    });
  });
}

function createNewPlayerListener(scene) {
  socket.on("newPlayer", function(playerInfo) {
    addOtherPlayer(scene, playerInfo);
  });
}

function createPlayerMovedListener(scene) {
  socket.on("playerMoved", playerInfo => {
    Object.values(scene.otherPlayers).forEach(otherPlayer => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
}
function createRemovePlayerListener(scene){
  socket.on("removePlayer", function(playerId) {
      if (socket.id == playerId) {
          scene.playerContainer.setActive(false);
          scene.playerContainer.destroy();
          if(scene.isMyTurn){
            socket.emit("finishedTurn");
            scene.isMyTurn = false;
          }
        }
        Object.values(scene.otherPlayers).forEach(player => {
          if (player){
            player.destroy();
          }
        });
    });
  }

function createFireBulletListener(scene) {
  socket.on("fireBullet", function(bulletInfo) {
    let playerToFire = scene.playerContainer;

    if(bulletInfo.alias !== scene.alias){
      scene.otherPlayers.getChildren().forEach(function(otherPlayer) {
        if(bulletInfo.alias === otherPlayer.alias){
          playerToFire = otherPlayer;
        }
      });
    }
    
    playerToFire.fire(
      scene,
      bulletInfo.angle,
      bulletInfo.power
    );
  });
}
function createMoveTurretListener(scene) {
  socket.on("moveTurret", function(turretInfo) {
    Object.values(scene.otherPlayers).forEach(otherPlayer => {
      if (turretInfo.playerId === otherPlayer.playerId) {
        rotateTurret(otherPlayer, turretInfo.turretRotation);
      }
    });
  });
}

function createStartTurn(scene) {
  socket.on("startTurn", function() {

    scene.isMyTurn = true;
  });
}

function createNextPlayerTurn(scene) {
  socket.on("nextPlayerTurn", function(alias) {
    if (alias == scene.alias) {
      allowedToEmit = true;
      scene.isMyTurn= true;
      scene.playerContainer.isMyTurn = true;
      scene.turnText.setColor("#00ff00");
    } else {
      scene.turnText.setColor("#ff0000");
      allowedToEmit = false;
    }
    scene.turnText.setText("Turn: " + alias);
  });
}

function createClearScene(scene){
  socket.on('clearScene', function(){
    /*scene.otherPlayers.getChildren().forEach(function(player){
      player.destroy();
    });*/
    Object.values(scene.otherPlayers).forEach(player => {
      if (player){
        player.destroy();
      }
    });
    if (scene.playerContainer) {
      scene.playerContainer.destroy();
    }
    if(scene.particles){
      scene.particles.destroy();
    }
  });
}

function createPlayerWon(scene) {
  socket.on("playerWon",function(player){
    let displayText;
    if(player){
      displayText = player + " won!";
    } else {
      displayText = "Draw!";
    }
    centerText = createCenterText(scene,displayText);
      setTimeout(function(){
        centerText.destroy();
      }, 3000)
  })
}