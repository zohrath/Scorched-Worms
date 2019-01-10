class Weapon extends Phaser.GameObjects.Sprite {
  constructor(scene, weaponSpriteName, bulletSpritename, radius, dmg, x, y) {
      super(scene, x, y, weaponSpriteName);
      this.setOrigin(0, 0.5);
      this.radius = radius;
      this.dmg = dmg;
      this.bulletSpritename = bulletSpritename;
      //this.setPosition(x, y);
      scene.matter.add.sprite(this);
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
