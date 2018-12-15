var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize: function Bullet(scene, radius, sprite, dmg, explosion) {
    this.bulletParticles = null;
    createBulletEmitter(scene, this);
    this.bulletEmitter.startFollow(this);
    this.bulletEmitter.on = false;
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, sprite);
    
    this.radius = radius;
    this.dmg = dmg;

    this.explosion = explosion;
    this.allowedToExplode = true;

    scene.matter.add.gameObject(this);
    scene.add.existing(this);
    scene.matterCollision.addOnCollideStart({
      objectA: this,
      callback: eventData => {
        const { bodyB, gameObjectB } = eventData;
        
        //|| gameObjectB instanceof Phaser.GameObjects.Container
        if (gameObjectB !== undefined && (gameObjectB instanceof Phaser.Tilemaps.Tile || gameObjectB instanceof Player )) {
          // Now you know that gameObjectB is a Tile, so you can check the index, properties, etc.
          if(this.allowedToExplode){
            this.explode(scene);
          }
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

  hide: function(){

    this.bulletEmitter.on = false;
    this.destroy();
    socketEmit("finishedTurn");
  },
  
  explode: function(scene){
    this.allowedToExplode = false;
    //scene.weaponEmitter.setScale(0.5);//this.radius/scene.weaponEmitter.size);
    //scene.weaponEmitter.explode(200, this.x, this.y);
    
    let explosionSprite = scene.add.sprite(this.x, this.y, 'explosionSpriteSheet').setScale(2);
    console.log(explosionSprite);
    explosionSprite.anims.play('explosionKey128')

    this.isPlayerHit();
    this.hide();

  },

  isPlayerHit: function(){
    let explosionInfo = {
      radius: this.radius,
      dmg: this.dmg,
      x: this.x,
      y: this.y
     }
    socketEmit("isPlayerHit", explosionInfo);
  }
});