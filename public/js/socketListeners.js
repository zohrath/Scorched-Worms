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
  createShowScoreboard(scene);
  createPlayerWon(scene);
  createSyncGamestate(scene);
  createRemoveTiles(scene);
  createUpdatePlatformLayer(scene);
  createUpdateHP(scene);
  createReadyTextListener(scene);
  createSetReadyListener(scene);
  
}

function createCurrentPlayersListener(scene) {
  socket.on("currentPlayers", players => {
    if(scene.lowCenterText){
      scene.lowCenterText.destroy();
    }
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
  socket.on("newPlayer", (playerInfo) => {
    addOtherPlayer(scene, playerInfo);
  });
}

function createPlayerMovedListener(scene) {
  socket.on("playerMoved", playerInfo => {
    if(playerInfo && playerInfo.x && playerInfo.y){

      updatePlayerPosition(scene, playerInfo);
    }
  });
}

function createRemovePlayerListener(scene) {
  socket.on("removePlayer", (playerId) => {
    if (socket.id == playerId) {
      scene.playerContainer.setActive(false);
      scene.playerContainer.destroyPlayer();
      if (scene.isMyTurn) {
        scene.isMyTurn = false;
      }
    } else {
      Object.keys(scene.otherPlayers).forEach(currID => {
        if (currID !== "undefined" && currID === playerId) {
          //scene.otherPlayers[currID].setActive(false);
          scene.otherPlayers[currID].destroyPlayer();
        }
      });
    }
  });
}

function createFireBulletListener(scene) {
  socket.on("fireBullet", (bulletInfo) => {
    let playerToFire = scene.playerContainer;

    if (bulletInfo.id !== socket.id) {
        Object.entries(scene.otherPlayers).forEach(function([key,otherPlayer]) {
          if (bulletInfo.id === key) {
            playerToFire = otherPlayer;
          }
        });
    }

    playerToFire.fire(scene, bulletInfo.angle, bulletInfo.power);
  });
}
function createMoveTurretListener(scene) {
  socket.on("moveTurret", (turretInfo) => {
    Object.values(scene.otherPlayers).forEach(otherPlayer => {
      if (turretInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setWeaponAngle(turretInfo.turretRotation);
      }
    });
  });
}

function createStartTurn(scene) {
  socket.on("startTurn", () => {
    scene.isMyTurn = true;
  });
}

function createNextPlayerTurn(scene) {
  socket.on("nextPlayerTurn", (nextPlayer) => {
    if (nextPlayer.id == socket.id) {
      allowedToEmit = true;
      scene.isMyTurn = true;
      scene.playerContainer.isMyTurn = true;
      scene.turnText.setColor("#00ff00");
      scene.playerContainer.fuel = 100;
      setFuelText(scene)
    } else {
      scene.turnText.setColor("#ff0000");
      scene.playerContainer.fuel = 0;
      setFuelText(scene)
      allowedToEmit = false;
    }
    scene.turnText.setText("Turn: " + nextPlayer.alias);
  });
}

function createClearScene(scene) {
  socket.on("clearScene", () => {
    /*scene.otherPlayers.getChildren().forEach(function(player){
      player.destroy();
    });*/
    Object.values(scene.otherPlayers).forEach(player => {
      if (player) {
        player.destroyPlayer();
      }
    });
    if (scene.playerContainer) {
      scene.playerContainer.destroyPlayer();
    }
    if (scene.particles) {
      scene.particles.destroy();
    }
    if (scene.highCenterText) {
      scene.highCenterText.destroy();
    }
  });
}

function createShowScoreboard(scene) {
  socket.on("showScoreboard",(scoreboard) => {
    let scoreText = createScoreBoardText(scoreboard);
    scene.scoreboardText = scene.add.text(
      game.canvas.width * 0.5,
      game.canvas.height * 0.5,
      scoreText,
      {
        align: "left",
        fontSize: "40px",
        fill: "#000",
        boundsAlignH: "center", // bounds center align horizontally
        boundsAlignV: "left"
      }
    );
    scene.scoreboardText.setOrigin(0.5, 0.5);


    setTimeout(function() {
      scene.scoreboardText.destroy();
    }, 3000);
  });
}

function createPlayerWon(scene) {
  socket.on("playerWon", (player) => {
    let displayText;
    if (player) {
      displayText = player + " wins the round!";
    } else {
      displayText = "Draw!";
    }
    updateCenterText(scene, displayText);
    setTimeout(function() {
      updateCenterText(scene, "");
    }, 3000);
  });
}

function createResetScene(scene) {
  socket.on("resetScene", function() {
    scene.scene.reset("GameScene");
  });
}

function createSyncGamestate(scene) {
  socket.on("syncGamestate", (syncInfo) => {
    destroyMap(scene);
    createMap(scene,syncInfo.mapInfo)
    Object.values(syncInfo.playerInfo).forEach(playerInfo => {
      updatePlayerPosition(scene, playerInfo);
      // TODO: add hp sync
    });
  });
}


function createRemoveTiles(scene) {
  socket.on("removeTiles", (tiles) => {
    tiles.forEach(tile => {
      let tilesToRemove = platformLayer.graphic.getTileAtWorldXY(tile.x, tile.y);
      removeTile(scene, tilesToRemove);
    });
  });
}

function createAddTiles(scene) {
  socket.on("addTiles", (tiles) => {
    tiles.forEach(tile => {
      addTile(tile.type, tile.x, tile.y);
    });
  });
}

function createUpdatePlatformLayer(scene) {
  socket.on("updatePlatformLayer", (map) => {
    destroyMap(scene);
    let tilesToAdd = map;
    addTiles(scene,tilesToAdd);
    platformLayer.physic = scene.matter.world.convertTilemapLayer(
      platformLayer.graphic
    );
  });
}

function createUpdateHP(scene){
  socket.on("updateHP", (players) => {
    Object.values(players).forEach(playerInfo => {
      if (playerInfo.hp > 0){
        let playerToUpdate = scene.otherPlayers[playerInfo.playerId];
        if (playerInfo.playerId === socket.id) {
          playerToUpdate = scene.playerContainer;
        }
        if(typeof(playerToUpdate.playerText) !== 'undefined'){
  
          playerToUpdate.playerText.setText(playerInfo.alias + "\n HP: " + playerInfo.hp);
        }
      }
    });
  });
}

function createReadyTextListener(scene){
  socket.on("isReady",(data) => {
    updateLowCenterText(scene,data.ready + " out of " + data.total + " Players ready");
    if(!scene.ready){

      updateCenterText(scene,"Press R when ready");
    }

  })


}

function createSetReadyListener(scene){
  socket.on("setReady",(bool) => {
    scene.ready = bool;
  });
}