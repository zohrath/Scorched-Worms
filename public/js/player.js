class Player extends Phaser.GameObjects.Container{



    constructor(self, character, weapon, playerInfo) {
        let characterSprite = self.add.sprite(0, 0, character);
        let weaponSprite = self.add.sprite(0, -7, weapon);
        weaponSprite.setOrigin(0, 0.5);
        super(self, playerInfo.x, playerInfo.y, []);
        self.physics.world.enable(this);
        self.physics.add.collider(this, self.terrain);

        
        this.playerId = playerInfo.playerId;
        this.add(characterSprite);
        this.add(weaponSprite);
        this.setSize(64,40);
        this.body.setBounce(0.3).setCollideWorldBounds(true);
        this.body.setMaxVelocity(300).setDragX(300);
        this.alias = playerInfo.alias
    }

    getWeaponAngle () {
        return this.list[1].rotation;
    }

    setWeaponAngle (angle) {
        this.list[1].rotation = angle;
    }

    flipCharacterX (bool) {
        this.list[0].flipX = bool;
    }
}