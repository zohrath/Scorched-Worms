function createSocketListners(self) {
  createCurrentPlayersListener(self);
  createNewPlayerListener(self);
  createPlayerMovedListener(self);
  createRemovePlayerListener(self);
  createFireBulletListener(self);
  createMoveTurretListener(self);
  createStartTurn(self);
  createNextPlayerTurn(self);
  createClearScene(self);
}

function createCurrentPlayersListener(self) {
  socket.on("currentPlayers", function(players) {
    Object.values(players).forEach(value => {
      if (value.playerId === socket.id) {
        addPlayer(self, value);
        self.ready = true;
      } else {
        addOtherPlayer(self, value);
      }
    });
  });
}

function createNewPlayerListener(self) {
  socket.on("newPlayer", function(playerInfo) {
    addOtherPlayer(self, playerInfo);
  });
}
function createPlayerMovedListener(self) {
  socket.on("playerMoved", playerInfo => {
    self.otherPlayers.getChildren().forEach(otherPlayer => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
}
function createRemovePlayerListener(self) {
  socket.on("removePlayer", function(playerId) {
    if (socket.id == playerId) {
      self.playerContainer.setActive(false);
      self.playerContainer.destroy();
      if (self.isMyTurn) {
        self.isMyTurn = false;
      }
    }
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
}

function createFireBulletListener(self) {
  socket.on("fireBullet", function(bulletInfo) {
    fireBullet(
      self,
      bulletInfo.x,
      bulletInfo.y,
      bulletInfo.angle,
      bulletInfo.power
    );
  });
}
function createMoveTurretListener(self) {
  socket.on("moveTurret", function(turretInfo) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (turretInfo.playerId === otherPlayer.playerId) {
        rotateTurret(otherPlayer, turretInfo.turretRotation);
      }
    });
  });
}

function createStartTurn(self) {
  socket.on("startTurn", function() {

    self.isMyTurn = true;
  });
}

function createNextPlayerTurn(self) {
  socket.on("nextPlayerTurn", function(alias) {
    if (alias == self.playerContainer.alias) {
      allowedToEmit = true;
      self.isMyTurn= true;
      self.playerContainer.isMyTurn = true;
    } else {
      allowedToEmit = false;
    }
    self.turnText.setText("Turn: " + alias);
  });
}

function createClearScene(self) {
  socket.on("clearScene", function() {
    self.otherPlayers.getChildren().forEach(function(player) {
      player.destroy();
    });
    if (self.playerContainer) {
      self.playerContainer.destroy();
    }
  });
}