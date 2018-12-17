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
    console.log(this);
    //super(scene, playerInfo.x, playerInfo.y, 'sheet', 'tank_right_resized.png', {shape: scene.shapes.tank_right});
  };
/*class Player extends Phaser.GameObjects.Container {
  constructor(scene, character, weapon, playerInfo, color) {
    let characterSprite = scene.add.sprite(0, 0, character);
    let weaponSprite = new Weapon(scene, "turret", "bullet", 10, 10);
    let playerText = scene.add.text(0, 0, playerInfo.alias, {
      fontSize: "18px Arial",
      fill: color,
      align: "center"
    });

    weaponSprite.setOrigin(0, 0.5);
    playerText.setOrigin(0.5, 2);
    super(scene, playerInfo.x, playerInfo.y, []);

    this.playerId = playerInfo.playerId;
    this.setSize(64, 40);
    this.add(characterSprite);
    this.add(weaponSprite);
    this.add(playerText);

    scene.matter.add.gameObject(this);

    //
    this.setBounce(0.0001);
    this.setMass(100);
    this.body.friction = 0.0001;
    this.body.frictionAir = 0.3;

    this.alias = playerInfo.alias;
    scene.add.existing(this);
  }
*/  
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
    this.turret.fire(scene, this.x, this.y, angle, power);
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
