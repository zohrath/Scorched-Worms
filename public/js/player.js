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
    this.prevPosition = {x: playerInfo.x, y: playerInfo.y, angle: 0, turretAngle: 0};
    // scene.add.existing(this);
    scene.add.existing(this.turret);
    //super(scene, playerInfo.x, playerInfo.y, 'sheet', 'tank_right_resized.png', {shape: scene.shapes.tank_right});
  };


  setFlipX(value) {
    this.tank.setFlipX(value);
  }
  
  setPosition(x, y){
    this.tank.body.position.x = x; 
    this.tank.body.position.y = y;
    this.syncSprites(); //onödigt? ev synch senare skede
  }

  setTurretAngle(angle){
    this.turret.angle = angle;
  }

  setTurretPosition() {
    this.turret.x = this.tank.body.position.x+2;
    this.turret.y = this.tank.body.position.y-13;
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
    this.turret.fire(scene, pos.x, pos.y, angle, power);
  }

  getWeaponAngle() {
    //return this.list[1].angle;
    return Math.round(this.turret.angle);
  }

  getTankAngle(){
    return this.tank.angle;
  }

  setTankAngle(angle){
    this.tank.angle = angle;
  } 

  setWeaponAngle(angle) {
    //this.list[1].angle = angle;
    //console.log(angle);
    this.turret.angle = angle;
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

  syncSprites(angle=null){
    //console.log("set tank angle", angle);
    this.setTurretPosition();
    this.setPlayerTextPosition();
    if(angle){
      console.log("In if statement, made it!");
      this.setTankAngle(angle);
    }

  }

  getCurrentPos(){
    let pos = this.tank.body.position;
    let angle = Math.round(this.tank.angle);
    let turretAngle = this.getWeaponAngle()
    return {x: Math.round(pos.x), y: Math.round(pos.y), angle: angle, turretAngle: turretAngle};
  }

  setPrevPos(newPos){
    this.prevPosition = {
      x: newPos.x,
      y: newPos.y,
      angle: newPos.angle,
      turretAngle: newPos.turretAngle
    };
  }
  getPrevPos(){
    //return this.tank.body.positionPrev;
    return this.prevPosition
  }

}
