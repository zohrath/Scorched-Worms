class Player extends Phaser.GameObjects.Container{
    constructor(self, character, weapon, playerInfo) {
        let characterSprite = self.add.sprite(0, 0, character);
        let weaponSprite = self.add.sprite(0, -7, weapon);
        weaponSprite.setOrigin(0, 0.5);
        super(self, playerInfo.x, playerInfo.y, []);
        this.add(characterSprite);
        this.add(weaponSprite);
        this.setSize(64,40);
        self.physics.world.enable(this);
        this.body.setBounce(0.3).setCollideWorldBounds(true);
        this.body.setMaxVelocity(300).setDragX(300);
        self.physics.add.collider(this, platforms);
        console.log(this.list[0].visible)
    }

    setWeaponAngle (angle) {
        this.list[1].rotation = angle;
    }

    flipCharacterX (bool) {
        this.list[0].flipX = bool;
    }
}