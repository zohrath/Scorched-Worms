var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize: function Bullet(scene, aoe, sprite, dmg) {
    Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'bullet');
    this.dx = 0;
    this.dy = 0;
    
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

  setValues: function(spriteName,aoe,dmg,x,y) {
    this.setPosition(x, y);
    this.texture.key = spriteName;
    this.aoe = aoe;
    this.dmg = dmg;
  }
});
