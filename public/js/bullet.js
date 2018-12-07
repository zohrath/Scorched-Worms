var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize: function Bullet(scene, radius, sprite, dmg, explosion) {
    this.bulletParticles = null;
    createBulletEmitter(scene, this);
    this.bulletEmitter.startFollow(this);
    this.bulletEmitter.on = true;
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, sprite);
    
    this.radius = radius;
    this.dmg = dmg;

    this.explosion = explosion; //TODO send as arg instead of 

    scene.matter.add.gameObject(this);
    scene.add.existing(this);
    scene.matterCollision.addOnCollideStart({
      objectA: this,
      callback: eventData => {
        const { bodyB, gameObjectB } = eventData;
        
        //|| gameObjectB instanceof Phaser.GameObjects.Container
        if (gameObjectB !== undefined && (gameObjectB instanceof Phaser.Tilemaps.Tile || gameObjectB instanceof Player )) {
          // Now you know that gameObjectB is a Tile, so you can check the index, properties, etc.
          this.explode(scene);
        }
      }
    });
  },

  fire: function(x, y, angle, speed) {
    
    this.setActive(true);
    this.setVisible(true);
    //  Bullets fire from the middle of the screen to the given x/y
    this.setPosition(x, y-40);
    this.setOrigin(0.5, 0.5);
    this.body.angle = angle;
    this.setMass(1);
    this.thrust(speed/5000);

  },

  destroyBullet: function(){
    this.bulletParticles.destroy();
    this.bulletEmitter.destroy();
    this.explosion.destroy();
    this.destroy();
  },
  

  hide: function(){
    console.log("HIDE BULLET");
    this.destroyBullet;
    socketEmit("finishedTurn");
  },
  
  explode: function(scene){
    this.explosion.explode(this.x, this.y);
    this.setVisible(false);
    this.setActive(false);
    setTimeout(this.hide, 1500);
  }
  //   this.setPosition(x, y);
  //   this.texture.key = spriteName;
  //   this.aoe = aoe;
  //   this.dmg = dmg;
  // }
});