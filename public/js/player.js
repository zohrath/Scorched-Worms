class Player extends Phaser.GameObjects.Container{
    constructor(scene, character, weapon, playerInfo, color) {
        let characterSprite = scene.add.sprite(0, 0, character);
        let weaponSprite = new Weapon(scene, "turret", "bullet", 1, 1); //scene.add.sprite(0, -7, weapon);
        console.log(weaponSprite);
        weaponSprite.setOrigin(0, 0.5);
        let playerText = scene.add.text(0, 0, playerInfo.alias, { fontSize: "18px Arial", fill: color, align: "center" });
        playerText.setOrigin(0.5, 2);
        super(scene, playerInfo.x, playerInfo.y, []);
        scene.physics.world.enable(this);
        scene.physics.add.collider(this, scene.terrain);

        
        this.playerId = playerInfo.playerId;
        this.setSize(64,40);
        this.add(characterSprite);
        this.add(weaponSprite);
        this.add(playerText);
        scene.physics.world.enable(this);
        this.body.setBounce(0.3).setCollideWorldBounds(true);
        this.body.setMaxVelocity(300).setDragX(300);
        scene.physics.add.collider(this, scene.terrain);
        this.alias = playerInfo.alias
        scene.add.existing(this);
    }

    fire (scene, angle, power) {

      this.list[1].fire(scene, this.x, this.y, angle, power);  
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