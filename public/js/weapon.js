class Weapon extends Phaser.GameObjects.Sprite{

    constructor(scene, weaponSpriteName, bulletSpritename, aoe, dmg) {
        super(scene, 0, -7, weaponSpriteName);
        this.aoe = aoe;
        this.dmg = dmg;
        this.bulletSpritename = bulletSpritename;
        scene.add.existing(this);
      }
    
    fire(scene, x, y, angle, speed) {
        console.log(scene.bullets);
        let bullet = scene.bullets.get();
        if (bullet) {
            console.log(bullet);
            bullet.setValues(this.bulletSpritename,this.aoe,this.dmg,200,200);
            bullet.fire(x, y, angle, power);
        }
        
      };
    
    update (time, delta) {
    
        if (this.x < 0 || this.x > game.canvas.width){
          this.hide();
        }
      };

};