class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, character, weapon, playerInfo, color) {
    scene.shapes = scene.cache.json.get('shapes');
    super(scene, playerInfo.x, playerInfo.y, 'sheet', 'tank_right_resized.png', {shape: scene.shapes_right});
    scene.matter.add.gameObject(this);
    this.setBounce(0.0001);
    this.setMass(100);
    this.body.friction = 0;
    this.body.frictionStatic = 0;
    this.body.frictionAir = 0.3;

    this.turret = new Weapon(scene, "turret", "bullet", 10, 10, this.x, this.y+15);

    this.playerId = playerInfo.playerId;
    this.alias = playerInfo.alias;
    this.playerText = scene.add.text(this.x, this.y-50, playerInfo.alias, {
      fontSize: "18px Arial",
      fill: color,
      align: "center"
    });
    this.playerText.setOrigin(0.5, 0)

    scene.add.existing(this);
    console.log(this);
  };
  
  setTurretPosition() {
      this.turret.x = this.x;
      this.turret.y = this.y-5;
  }

  setPlayerTextPosition() {
    this.playerText.x = this.x;
    this.playerText.y = this.y-50;
  }

  thrust(force) {
    this.thrust(force);
  }

  thrustBack(force) {
    this.thrustBack(force);
  }

  fire(scene, angle, power) {
    this.turret.fire(scene, (this.turret.x+40*Math.cos(this.getWeaponAngle())), (this.turret.y+15*Math.sin(this.getWeaponAngle())), angle, power);
  }

  getWeaponAngle() {
    return this.turret.rotation;
  }

  setWeaponAngle(angle) {
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

    this.turret.destroy();
    this.playerText.destroy();
    this.destroy();
  }

  getCurrentPos(){
    return this.body.position;
  }

  getPrevPos(){
    return this.body.positionPrev;
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
