class Player {
  constructor(scene, character, weapon, playerInfo, color) {
    scene.shapes = scene.cache.json.get('shapes');
    this.tank = scene.matter.add.sprite(playerInfo.x, playerInfo.y, 'sheet', 'tank_right_resized.png', {shape: scene.shapes.tank_right});
  
    this.tank.setBounce(0.0001);
    this.tank.setMass(100);
    this.tank.body.friction = 0;
    this.tank.body.frictionStatic = 0;
    this.tank.body.frictionAir = 0.3;

    this.turret = new Weapon(scene, "turret", "bullet", 10, 10, this.tank.x+2, this.tank.y+15);

    this.playerId = playerInfo.playerId;
    this.alias = playerInfo.alias;
    this.playerText = scene.add.text(this.tank.x, this.tank.y-50, playerInfo.alias, {
      fontSize: "18px Arial",
      fill: color,
      align: "center"
    });
    this.playerText.setOrigin(0.5, 0)

    scene.add.existing(this.tank);
  };
 
  setFlipX(value) {
    this.tank.setFlipX(value);
  }

  setTurretPosition() {
    this.turret.x = this.tank.x+2;
    this.turret.y = this.tank.y-13;
  }

  setPlayerTextPosition() {
    this.playerText.x = this.tank.x;
    this.playerText.y = this.tank.y-50;
  }

  thrust(force) {
    this.tank.thrust(force);
  }

  thrustBack(force) {
    this.tank.thrustBack(force);
  }

  fire(scene, angle, power) {
    this.turret.fire(scene, this.turret.x, this.turret.y, angle, power);
  }

  getWeaponAngle() {
    //return this.list[1].rotation;
    return this.turret.rotation;
  }

  setWeaponAngle(angle) {
    //this.list[1].rotation = angle;
    //console.log(angle);
    this.turret.rotation = angle;
  }

  flipCharacterX(bool) {
    this.list[0].flipX = bool;
  }

  getPlayerInfo() {
    let basicInfo = {
      x: this.x,
      y: this.y,
      alias: this.alias,
      playerId: this.playerId
    };
    return basicInfo;
  }
  destroy() {
    this.tank.destroy();
    this.turret.destroy();
    this.playerText.destroy();
  }
}
