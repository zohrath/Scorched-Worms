class Player extends Phaser.GameObjects.Container{
    constructor(self, character, weapon, playerInfo, color) {
        let characterSprite = self.add.image(0, 0, character);
        let weaponSprite = self.add.image(0, -7, weapon);
        weaponSprite.setOrigin(0, 0.5);
        let playerText = self.add.text(0, 0, playerInfo.alias, { fontSize: "18px Arial", fill: color, align: "center" });
        playerText.setOrigin(0.5, 2);
        super(self, playerInfo.x, playerInfo.y, [characterSprite, weaponSprite]);
        this.playerId = playerInfo.playerId;
        this.setSize(64,40);
        //this.add(characterSprite);
        //his.add(weaponSprite);
        this.add(playerText);
         //.setCollideWorldBounds(true);
        
        //self.physics.add.collider(this, self.terrain);
        self.matter.add.gameObject(this);
        self.add.existing(this);
        this.setBounce(0.5);
        //this.body.setMaxVelocity(300);//.setDragX(300);
        this.setMass(100);
        console.log("Tank created");
        console.log(this.body);
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