class Weapon extends Phaser.GameObjects.Sprite {
  constructor(scene, weaponSpriteName, bulletSpritename, radius, dmg) {
    super(scene, 0, -7, weaponSpriteName);
    this.setOrigin(0, 0.5);
    this.radius = radius;
    this.dmg = dmg;
    this.bulletSpritename = bulletSpritename;
    scene.add.existing(this);
  }
    
  fire(scene, x, y, angle, power) {
      let bullet = new Bullet(scene, this.radius, 'bullet', this.dmg);
      if (bullet) {
          scene.bullets.push(bullet);
          bullet.fire(x, y, angle, power);
      }
      else{ 
          console.log("invalid bullet, oh noes!")
      }
      
    };
};
