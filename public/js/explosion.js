class Explosion extends Phaser.GameObjects.Sprite {
  constructor(scene, radius, dmg, x, y, image) {
    super(scene,x, y, image);
    this.radius = radius;
    this.dmg = dmg;
    this.x = x;
    this.y = y;
    this.setOrigin(0.5,0.5);
    this.image = image;
    scene.physics.world.enable(this);
    this.body.setCircle(4);
    this.setScale(radius);
    this.body.setAllowGravity(false);
    scene.add.existing(this);
  }

  getBasicInfo() {
    let info = {
      radius: this.radius,
      dmg: this.dmg,
      x: this.x,
      y: this.y
    };
    return info;
  }

}
