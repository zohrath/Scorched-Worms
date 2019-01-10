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
    this.fuel = 0;
    this.playerId = playerInfo.playerId;

    this.setSize(64, 40);
    this.add(this.tank);
    this.add(this.turret);
    this.add(this.playerText);

    // TODO: might be bugged
    scene.matter.add.gameObject(this, { isStatic: isStatic});

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

  fire(scene, angle, power) {
    let endTurret = new Phaser.Geom.Point(this.x, this.y-5);
    //console.log("print fire", (this.x+40*Math.cos(angle) - this.x), (this.y+40*Math.sin(angle) - this.y));
    endTurret.x += (Math.cos(angle*Math.PI/180) * 40);
    endTurret.y += (Math.sin(angle*Math.PI/180) * 40);
    this.turret.fire(scene, endTurret.x, endTurret.y, angle, power);
  }

  getWeaponAngle() {
    return Math.round(this.turret.angle + this.angle);
  }


  setWeaponAngle(angle) {
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
    return this.prevPosition
  }
  setEmitter(scene){
    let currentPos = this.getCurrentPos();
    let prevPos = this.getPrevPos();
    if (currentPos.x>prevPos.x){
      scene.emitter.startFollow(this.body, -30, 8);  
    }
    else if (currentPos.x<prevPos.x){
      scene.emitter.startFollow(this.body, 30, 8);
    }
  }
}
