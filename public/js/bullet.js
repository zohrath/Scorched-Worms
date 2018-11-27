var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize: function Bullet(scene) {
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'bullet');
    this.dx = 0;
    this.dy = 0;
    this.lifespan = 10000;
    // this.setCollideWorldBounds(true);
  },

  fire: function(x, y, angle, speed) {
    this.setActive(true);
    this.setVisible(true);
    //  Bullets fire from the middle of the screen to the given x/y
    this.setPosition(x, y);

    //  we don't need to rotate the bullets as they are round
    //  this.setRotation(angle);

    // this.dx = Math.cos(angle);
    // this.dy = Math.sin(angle);
    this.body.world.scene.physics.velocityFromRotation(
      angle,
      speed,
      this.body.velocity
    );
    // this.body.setAccelerationX(Math.cos(angle)*1000);
    // this.body.setAccelerationY(Math.sin(angle)*1000);
    // this.body.setMaxVelocity(50,50);
  },

  update: function(time, delta) {
    /*this.lifespan -= delta;
    // this.x += this.dx * (this.speed * delta);
    // this.y += this.dy * (this.speed * delta);
    if (this.lifespan <= 0) {
      this.setActive(false);
      this.setVisible(false);
    }*/
    if (this.x < 0 || this.x > game.canvas.width){
      this.hide();
    }
  },

  hide: function(){
    this.setActive(false);
    this.setVisible(false);
    this.destroy(); 
    socketEmit("finishedTurn");
  }
});
