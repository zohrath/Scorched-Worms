class Weapon extends Phaser.GameObjects.Sprite{

    constructor(scene, weaponSpriteName, bulletSpritename, radius, dmg) {
        super(scene, 0, -7, weaponSpriteName);
        this.radius = radius;
        this.dmg = dmg;
        this.bulletSpritename = bulletSpritename;
        scene.add.existing(this);
      }
    
    fire(scene, x, y, angle, power) {
        let bullet = new Bullet(scene, this.radius, 'bullet', this.dmg);//scene.bullets.get();
        if (bullet) {
            //scene.bullets = []
            //bullet.setValues(this.bulletSpritename,this.aoe,this.dmg,200,200);
            scene.bullets.push(bullet);
            bullet.fire(x, y, angle, power);
        }
        
      };
};