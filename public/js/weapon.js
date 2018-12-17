class Weapon extends Phaser.GameObjects.Sprite {
  constructor(scene, weaponSpriteName, bulletSpritename, radius, dmg) {
    super(scene, 0, -7, weaponSpriteName);
    this.radius = radius;
    this.dmg = dmg;
    this.bulletSpritename = bulletSpritename;
    scene.add.existing(this);
  }
    
  fire(scene, x, y, angle, power) {
      let explosion = new Explosion(scene, this.radius, this.dmg,this.x,this.y, "bullet");
      let bullet = new Bullet(scene, this.radius, 'bullet', this.dmg, explosion);//scene.bullets.get();
      if (bullet) {
          //scene.bullets = []
          //bullet.setValues(this.bulletSpritename,this.aoe,this.dmg,200,200);
          scene.bullets.push(bullet);
          bullet.fire(x, y, angle, power);
      }
      else{ 
          console.log("invalid bullet, oh noes!")
      }
      
    };
};
