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
  createSyncGamestate(scene);
  createRemoveTiles(scene);
  createUpdatePlatformLayer(scene);
  createUpdateHP(scene);
}

function createCurrentPlayersListener(scene) {
  socket.on("currentPlayers", (players) => {
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
    updatePlayerPosition(scene, playerInfo);
  });
}

function createRemovePlayerListener(scene) {
  socket.on("removePlayer", (playerId) => {
    if (socket.id == playerId) {
      // scene.playerContainer.setActive(false);
      scene.playerContainer.destroyPlayer();
      if (scene.isMyTurn) {
        socket.emit("finishedTurn");
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

    if (bulletInfo.alias !== scene.alias) {
      Object.values(scene.otherPlayers).forEach(function(otherPlayer) {
        if (bulletInfo.alias === otherPlayer.alias) {
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
        otherPlayer.setTurretRotation(turretInfo.turretRotation);
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
  socket.on("nextPlayerTurn", (alias) => {
    if (alias == scene.alias) {
      allowedToEmit = true;
      scene.isMyTurn = true;
      scene.playerContainer.isMyTurn = true;
      scene.turnText.setColor("#00ff00");
    } else {
      scene.turnText.setColor("#ff0000");
      allowedToEmit = false;
    }
    scene.turnText.setText("Turn: " + alias);
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
  });
}

function createPlayerWon(scene) {
  socket.on("playerWon", (player) => {
    let displayText;
    if (player) {
      displayText = player + " won!";
    } else {
      displayText = "Draw!";
    }
    centerText = createCenterText(scene, displayText);
    setTimeout(function() {
      centerText.destroy();
    }, 3000);
  });
}

function createResetScene(scene) {
  socket.on("resetScene", function() {
    scene.scene.reset("GameScene");
  });
}

function createSyncGamestate(scene) {
  socket.on("syncGamestate", (players) => {
    Object.values(players).forEach(playerInfo => {
      updatePlayerPosition(scene, playerInfo);
      // TODO: add hp sync
      // TODO: add terrain sync
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
      let playerToUpdate = scene.otherPlayers[playerInfo.playerId];
      if (playerInfo.playerId === socket.id) {
        playerToUpdate = scene.playerContainer;
      }
      playerToUpdate.playerText.setText(playerInfo.alias + "\n HP: " + playerInfo.hp);
    });
  });
}
