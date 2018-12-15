class Explosion extends Phaser.GameObjects.Sprite {
  constructor(scene, radius, dmg, x, y, image) {
    super(scene, x, y, image);
    scene.matter.add.gameObject(this, { isStatic: true, isSensor: true });
    this.radius = radius;
    this.dmg = dmg;

    this.image = image;
    this.setCircle(4);
    this.setScale(radius);
    scene.add.existing(this);

    this.setActive(true);
    this.setVisible(false);

    scene.matterCollision.addOnCollideStart({
      objectA: this,
      callback: eventData => {
        const { bodyB, gameObjectB } = eventData;

        //|| gameObjectB instanceof Phaser.GameObjects.Container
        if (gameObjectB !== undefined && gameObjectB instanceof Player) {
          // Now you know that gameObjectB is a Tile, so you can check the index, properties, etc.
          console.log("PLAYER HIT", gameObjectB);
          playerHit(gameObjectB, this);
        }
      }
    });
  }

  explode(x, y) {
    this.x = x;
    this.y = y;
    this.setOrigin(0.5, 0.5);

    this.setVisible(true);
    this.setActive(true);
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
