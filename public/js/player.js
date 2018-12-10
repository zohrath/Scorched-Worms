class Player extends Phaser.GameObjects.Container {
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

  fire(scene, angle, power) {
    this.list[1].fire(scene, this.x, this.y, angle, power);
  }

  getWeaponAngle() {
    return this.list[1].rotation;
  }

  setWeaponAngle(angle) {
    this.list[1].rotation = angle;
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
}
