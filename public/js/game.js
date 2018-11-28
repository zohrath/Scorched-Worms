let platforms;
let cursors;
let player;
let power = 0;
let mouseAngle = 0;
let socket;
let keyD;
let keyR;
let keyX;
let skipMenu = true;
let edgeSize = 4;


class GameScene extends Phaser.Scene {

  constructor ()
    {
        super({ key: 'GameScene' });
    }

  preload() {
    this.load.image("green", "assets/green.png");
    this.load.image("tank_right", "assets/tank_right.png");
    this.load.image("tank_left", "assets/tank_left.png");
    this.load.image("tank", "assets/tank_right.png");
    this.load.image("background", "assets/background_vulcano.png");
    this.load.image("ground", "assets/ground.png");
    this.load.image("turret", "assets/turret.png");
    this.load.image("smoke", "assets/smoke-puff.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image('land', 'assets/land.png');
  }

  create() {
    this.nextTic = 0;
    let self = this;
    this.isMyTurn = false;
    this.ready = false;
    createWorld(this);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.cursors = this.input.keyboard.createCursorKeys();

    socket = io();
    this.otherPlayers = this.physics.add.group();

    createSocketListners(self);
    //COLLIDERS
    this.physics.add.collider(
      this.bullets,
      this.terrain,
      explodeBullet,
      null,
      self
    );
    this.physics.add.collider(
      this.bullets,
      this.otherPlayers,
      explodeBullet,
      null,
      self
    );

    this.input.on(
      "pointermove",
      function (pointer) {
        let cursor = pointer;
        if (typeof this.playerContainer == "object") {
          mouseAngle = Phaser.Math.Angle.Between(
            this.playerContainer.x,
            this.playerContainer.y,
            cursor.x + this.cameras.main.scrollX,
            cursor.y + this.cameras.main.scrollY
          );
        }
      },
      this
    );
  }

  update(time, delta) {


    if (keyX.isDown) {
      console.log(this);
      console.log(
        typeof this.playerContainer,
        this.isMyTurn,
        this.ready,
        this
      );
    }
    
    if (keyD.isDown){
      console.log("force start")
      socket.emit("forceStart");
      this.ready
    }
    if (!this.ready) {
      if (keyR.isDown) {
        socket.emit("clientReady");
        this.ready = true;
      }
      return;
    }
    if (
      typeof this.playerContainer !== "undefined" &&
      this.playerContainer.active &&
      this.isMyTurn
    ) {
      this.playerContainer.setWeaponAngle(mouseAngle);
      movePlayer(this, time, delta);
      // save old position data
      this.playerContainer.oldPosition = {
        x: this.playerContainer.x,
        y: this.playerContainer.y,
        rotation: this.playerContainer.rotation,
        turretRotation: this.playerContainer.getWeaponAngle()
      };
      if (this.playerContainer.body.velocity.x > 0) {
        this.emitter.startFollow(this.playerContainer, -30, 8);
        this.playerContainer.list[0].flipX = false;
        this.emitter.on = true;
      } else if (this.playerContainer.body.velocity.x < 0) {
        this.emitter.startFollow(this.playerContainer, 30, 8);
        this.playerContainer.list[0].flipX = true;
        this.emitter.on = true;
      } else {
        this.emitter.on = false;
      }
  }
}
}

let config = {
  type: Phaser.AUTO,
  parent: "ScorchedWorms",
  width: 1024,
  height: 768,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 300 }
    }
  },
  scene: [MainMenu, GameScene]
};

let game = new Phaser.Game(config);
