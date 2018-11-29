class Explosion extends Phaser.GameObjects.Image{
    constructor(radius, dmg, x, y, image){
        this.radius = radius;
        this.dmg = dmg;
        this.x = x;
        this.y = y;
        this.image = image;
    }
}