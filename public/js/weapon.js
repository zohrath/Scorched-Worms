class Weapon extends Phaser.GameObjects.Sprite{

    constructor(scene, weaponSpriteName, bulletSpritename, aoe, dmg) {
        super(scene, 0, -7, weaponSpriteName);
        this.aoe = aoe;
        this.dmg = dmg;
        this.bulletSpritename = bulletSpritename;
        scene.add.existing(this);
      }
    
    fire(scene, x, y, angle, power) {
        let bullet = scene.bullets.get();
        if (bullet) {
            bullet.setValues(this.bulletSpritename,this.aoe,this.dmg,200,200);
            bullet.fire(x, y, angle, power);
        }
        
      };
};