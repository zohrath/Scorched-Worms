var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize: function Bullet(scene, radius, sprite, dmg) {
    this.bulletParticles = null;
    createBulletEmitter(scene, this);
    this.bulletEmitter.startFollow(this);
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, sprite);

    this.radius = radius;
    this.dmg = dmg;
    this.allowedToExplode = true;

    scene.add.existing(this);
    scene.matter.add.gameObject(this);
    scene.matterCollision.addOnCollideStart({
      objectA: this,
      callback: eventData => {
        const { bodyB, gameObjectB } = eventData;

        //|| gameObjectB instanceof Phaser.GameObjects.Container
        if (
          gameObjectB !== undefined &&
          (gameObjectB instanceof Phaser.Tilemaps.Tile ||
            gameObjectB instanceof Player)
        ) {
          // Now you know that gameObjectB is a Tile, so you can check the index, properties, etc.
          if (this.allowedToExplode) {
            this.explode(scene);
          }
        }
      }
    });
  },

  fire: function(x, y, angle, speed) {
    console.log("x,y", x, " , ", y);
    this.setActive(true);
    this.setVisible(true);
    this.bulletEmitter.on = true;
    this.bulletEmitter.active = true;
    //  Bullets fire from the middle of the screen to the given x/y
    this.setPosition(x, y - 60);
    //this.setOrigin(0.5, 0.5);
    this.body.angle = angle;
    this.setMass(1);
    this.thrust(speed / 5000);
    console.log("firing mah laza", this);
  },

  hide: function() {
    this.bulletEmitter.on = false;
    this.destroy();
    socketEmit("finishedTurn");
  },

  explode: function(scene) {
    this.allowedToExplode = false;
    //scene.weaponEmitter.setScale(0.5);//this.radius/scene.weaponEmitter.size);
    //scene.weaponEmitter.explode(200, this.x, this.y);

    let explosionSprite = scene.add
      .sprite(this.x, this.y, "explosionSpriteSheet")
      .setScale(2);
    explosionSprite.anims.play("explosionKey128");

    this.isPlayerHit();
    this.hide();
  },

  isPlayerHit: function() {
    let explosionInfo = {
      radius: this.radius,
      dmg: this.dmg,
      x: this.x,
      y: this.y
    };
    socketEmit("isPlayerHit", explosionInfo);
  }
});
