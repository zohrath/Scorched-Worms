var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize: function Bullet(scene, radius, sprite, dmg) {
    this.bulletParticles = null;
    createBulletEmitter(scene, this);
    this.bulletEmitter.startFollow(this);
    this.bulletEmitter.on = false;
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, sprite);

    this.setActive(false);

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

  //TODO see if pos correct
  fire: function(x, y, angle, speed) {
    this.setActive(true);
    this.setVisible(true);
    this.bulletEmitter.on = true;
    this.bulletEmitter.active = true;
    //  Bullets fire from the middle of the screen to the given x/y
    this.setPosition(x, y);
    this.setAngle(angle);
    this.setMass(1);
    this.thrust(speed / 5000);
  },

  hide: function() {
    this.bulletEmitter.on = false;
    this.destroy();
    socketEmit("finishedTurn");
  },

  explode: function(scene) {
    this.allowedToExplode = false;

    let explosionSprite = scene.add
      .sprite(this.x, this.y, "explosionSpriteSheet")
      .setScale(2);
    explosionSprite.anims.play("explosionKey128");
    scene.explosionSound.play();
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
