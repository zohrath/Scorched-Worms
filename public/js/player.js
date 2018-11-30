class Player {
  constructor(scene, character, weapon, playerInfo, color) {
    let shapes = scene.cache.json.get('shapes');
    this.tank = scene.matter.add.sprite(playerInfo.x, playerInfo.y, 'sheet', 'tank_right_resized.png', {shape: shapes.tank_right});
  
    this.tank.setBounce(0.0001);
    this.tank.setMass(100);
    this.tank.body.friction = 0;
    this.tank.body.frictionStatic = 0;
    this.tank.body.frictionAir = 0.3;

    this.turret = new Weapon(scene, "turret", "bullet", 40, 10, this.tank.x+2, this.tank.y+15);

    this.playerId = playerInfo.playerId;
    this.alias = playerInfo.alias;
    this.playerText = scene.add.text(playerInfo.x, playerInfo.y, playerInfo.alias + "\n HP: " + playerInfo.hp, {
    fontSize: "18px Arial",
      fill: color,
      align: "center"
    });

    this.playerText.setOrigin(0.5, 1);
    this.oldPosition = {turretRotation: 0};
    // scene.add.existing(this);
    scene.add.existing(this.turret);
    // scene.add.existing(this.tank);
    console.log(this);
    //super(scene, playerInfo.x, playerInfo.y, 'sheet', 'tank_right_resized.png', {shape: scene.shapes.tank_right});
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
    let pos = this.getCurrentPos()
    console.log("in player fire scene:", scene, "x,y", pos.x, pos.y, " angle, power:", angle, power);
    this.turret.fire(scene, pos.x, pos.y, angle, power);
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

  destroyPlayer() {
    this.tank.destroy();
    this.turret.destroy();
    this.playerText.destroy();
  }

  update(){
    this.setTurretPosition();
    this.setPlayerTextPosition();
  }

  getCurrentPos(){
    return this.tank.body.position;
  }

  getPrevPos(){
    return this.tank.body.positionPrev;
  }
}
