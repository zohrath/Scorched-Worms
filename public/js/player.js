class Player extends Phaser.GameObjects.Container{
    constructor(self, character, weapon, playerInfo, color) {
        let characterSprite = self.add.sprite(0, 0, character);
        let weaponSprite = self.add.sprite(0, -7, weapon);
        weaponSprite.setOrigin(0, 0.5);
        let playerText = self.add.text(0, 0, playerInfo.alias, { fontSize: '16px', fill: color });
        console.log(playerInfo.alias, playerText);
        playerText.setOrigin(0.5, 2.6);
        super(self, playerInfo.x, playerInfo.y, []);
        this.playerId = playerInfo.playerId;
        this.add(characterSprite);
        this.add(weaponSprite);
        this.add(playerText);
        this.setSize(64,40);
        self.physics.world.enable(this);
        this.body.setBounce(0.3).setCollideWorldBounds(true);
        this.body.setMaxVelocity(300).setDragX(300);
        self.physics.add.collider(this, self.terrain);
        
        self.add.existing(this);
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