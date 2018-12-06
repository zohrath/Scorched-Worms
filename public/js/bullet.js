var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize: function Bullet(scene) {
    this.bulletParticles = null;
    createBulletEmitter(scene, this);
    this.bulletEmitter.startFollow(this);
    this.bulletEmitter.on = true;
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'bullet');
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
          this.hide();
          console.log(gameObjectB);
        }
      }
    });
    
    //this.lifespan = 10000;
    // this.setCollideWorldBounds(true);
  },

  fire: function(x, y, angle, speed) {
    
    this.setActive(true);
    this.setVisible(true);
    //  Bullets fire from the middle of the screen to the given x/y
    this.setPosition(x, y-40);
    this.setOrigin(0.5, 0.5);
    this.body.angle = angle;
    this.setMass(1);
    this.thrust(speed/10000);

    //  we don't need to rotate the bullets as they are round
    //  this.setRotation(angle);
    // this.dx = Math.cos(angle);
    // this.dy = Math.sin(angle);

    /*this.body.world.scene.physics.velocityFromRotation(
      angle,
      speed,
      this.body.velocity
    );*/
    
    // this.body.setAccelerationX(Math.cos(angle)*1000);
    // this.body.setAccelerationY(Math.sin(angle)*1000);
    // this.body.setMaxVelocity(50,50);
  },

  update: function(time, delta) {
    /*if (this.x < 0 || this.x > game.canvas.width){
      this.hide;
    }*/
  },

  hide: function(){
    this.bulletParticles.destroy();
    this.destroy();
    socketEmit("finishedTurn");
  },

  explode: function(scene){
    let explosion = new Explosion(scene,this.radius,this.dmg,this.x,this.y,"bullet");
    setTimeout(function(){
      explosion.destroy()},2000);
  }

  // setValues: function(spriteName,aoe,dmg,x,y) {
  //   this.setPosition(x, y);
  //   this.texture.key = spriteName;
  //   this.aoe = aoe;
  //   this.dmg = dmg;
  // }
});
