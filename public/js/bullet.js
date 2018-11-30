var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize: function Bullet(scene, radius, sprite, dmg) {
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'bullet');
    this.dx = 0;
    this.dy = 0;
    this.radius = radius;
    this.dmg = dmg;
    console.log(this);
    
  },

  fire: function(x, y, angle, speed) {
    this.setPosition(x, y);

    this.body.world.scene.physics.velocityFromRotation(
      angle,
      speed,
      this.body.velocity
    );
  },

  update: function(time, delta) {
    if (this.x < 0 || this.x > game.canvas.width){
      this.hide();
    }
  },

  hide: function(){
    this.destroy();
    socketEmit("finishedTurn");
  },

  explode: function(scene){
    let explosion = new Explosion(scene,this.radius,this.dmg,this.x,this.y,"bullet");
    scene.physics.add.overlap(scene.otherPlayers,explosion,playerHit);
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
