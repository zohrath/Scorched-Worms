function createSocketListners(self) {
    createCurrentPlayersListener(self);
    createNewPlayerListener(self);
    createPlayerMovedListener(self);
    createRemovePlayerListener(self);
    createFireBulletListener(self);
    createMoveTurretListener(self);
}

function createCurrentPlayersListener(self){
socket.on("currentPlayers", function(players) {
    Object.values(players).forEach(value => {
      if (value.playerId === socket.id) {
        addPlayer(self, value);
        turretInContainer = playerContainer.list[1]; // Is this the position of the turret always?
      } else {
        addOtherPlayer(self, value);
      }
    });
  });
}

function createNewPlayerListener(self){
  socket.on("newPlayer", function(playerInfo) {
    addOtherPlayer(self, playerInfo);
  });
}
function createPlayerMovedListener(self){
  socket.on("playerMoved", playerInfo => {
    self.otherPlayers.getChildren().forEach(otherPlayer => {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
}
function createRemovePlayerListener(self){
      socket.on("removePlayer", function(playerId) {
          if (socket.id == playerId) {
              playerContainer.setActive(false);
              playerContainer.setVisible(false);
              playerContainer.destroy();
            }
            self.otherPlayers.getChildren().forEach(function(otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });
    }

function createFireBulletListener(self){
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
function createMoveTurretListener(self){
  socket.on("moveTurret", function(turretInfo) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (turretInfo.playerId === otherPlayer.playerId) {
        rotateTurret(otherPlayer,turretInfo.turretRotation);
      }
    });
  });
}