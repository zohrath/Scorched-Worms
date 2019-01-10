class Player extends Phaser.GameObjects.Container {
  constructor(scene, character, turretSprite, playerInfo, color, isStatic) {
    super(scene, playerInfo.x, playerInfo.y, []);
    
    this.tank = scene.add.sprite(0, 0, character);
    this.turret = new Weapon(scene, turretSprite, "bullet", 60, 10, 0, -5);
    this.alias = playerInfo.alias;
    this.playerText = scene.add.text(0, 0, playerInfo.alias + "\n HP: " + playerInfo.hp, {
    fontSize: "18px Arial",
      fill: color,
      align: "center"
    });

    this.playerText.setOrigin(0.5, 2);

    this.playerId = playerInfo.playerId;
    this.setSize(64, 40);
    this.add(this.tank);
    this.add(this.turret);
    this.add(this.playerText);

    scene.matter.add.gameObject(this);//, { isStatic: isStatic});

    this.setBounce(0.0001);
    this.setMass(100);
    this.body.friction = 0.0001;
    this.body.frictionAir = 0.3;

    this.alias = playerInfo.alias;
    this.prevPosition = {x: playerInfo.x, y: playerInfo.y, angle: 0, turretAngle: 0};
    scene.add.existing(this);
  }

  setFlipX(value) {
    this.tank.setFlipX(value);
  }
   // TODO: flip body as well
   flipCharacterX(bool) {
    this.tank.flipX = bool;
  }

  // setTurretPosition() {
  //   this.turret.x = this.tank.body.position.x+2;
  //   this.turret.y = this.tank.body.position.y-13;
  // }

  // setPlayerTextPosition() {
  //   this.playerText.x = this.tank.x;
  //   this.playerText.y = this.tank.y-50;
  // }

  // thrust(force) {
  //   this.tank.thrust(force);
  // }

  // thrustBack(force) {
  //   this.tank.thrustBack(force);
  // }

  fire(scene, angle, power) {
    let endTurret = new Phaser.Geom.Point(this.x, this.y-5);
    //console.log("print fire", (this.x+40*Math.cos(angle) - this.x), (this.y+40*Math.sin(angle) - this.y));
    endTurret.x += (Math.cos(angle*Math.PI/180) * 40);
    endTurret.y += (Math.sin(angle*Math.PI/180) * 40);
    this.turret.fire(scene, endTurret.x, endTurret.y, angle, power);
  }

  getWeaponAngle() {
    //return this.list[1].angle;
    return Math.round(this.turret.angle + this.angle);
  }

  // getTankAngle(){
  //   return this.tank.angle;
  // }

  // setTankAngle(angle){
  //   this.tank.angle = angle;
  // } 

  setWeaponAngle(angle) {
    //this.list[1].angle = angle;
    //console.log(angle);
    this.turret.angle = (angle-this.angle);
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
    this.destroy();
  }

  // syncSprites(angle=null){
  //   //console.log("set tank angle", angle);
  //   this.setTurretPosition();
  //   this.setPlayerTextPosition();
  //   if(angle){
  //     console.log("In if statement, made it!");
  //     this.setTankAngle(angle);
  //   }

  // }

  getCurrentPos(){
    let pos = this.body.position;
    let angle = Math.round(this.angle);
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
