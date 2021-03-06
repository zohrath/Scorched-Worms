let cursors;
let player;
let power = 0;
let mouseAngle = 0;
let socket;
let keyD;
let keyR;
let keyX;
let allowedToEmit = false;
let skipMenu = false;
let edgeSize = 4;
let platformLayer = {};
let tileset;
let allowedToForce = true;

class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene",
      physics: {
        arcade: {
          debug: false,
          gravity: { y: 200 }
        },
        matter: {
          debug: false,
          gravity: { y: 3 }
        }
      },
      plugin: PhaserMatterCollisionPlugin // The plugin class
    });
  }

  preload() {
    this.load.image("green", "assets/green.png");
    //this.load.image("tank_right", "assets/tank_right.png");
    this.load.image("tank_left", "assets/tank_left.png");
    this.load.image("tank", "assets/tank_right.png");
    this.load.image("ground", "assets/ground.png");
    this.load.image("turret", "assets/turret.png");
    this.load.image("smoke", "assets/smoke-puff.png");
    this.load.image("bullet", "assets/bullet.png");

    this.load.image("background_vulcano", "assets/background_vulcano.png");
    this.load.image("background_mountain", "assets/background_mountain.png")
    this.backgroundImages = ["background_vulcano", "background_mountain"];

    this.load.tilemapTiledJSON("map", "assets/scorchedworms.json");
    this.load.image("swImg", "assets/scorchedworms.png");

    this.load.spritesheet("explosionSpriteSheet128", "/assets/explode.png", {
      frameWidth: 128,
      frameHeight: 128
    });

    // Load sprite sheet generated with TexturePacker
    this.load.multiatlas('sheet', 'assets/tank_right_resized.json', 'assets');
    // Load body shapes from JSON file generated using PhysicsEditor
    this.load.json('shapes', 'assets/tank_test.json');

    this.load.audio('soundtrack','assets/DancingCloudsChiptuneSong.ogg');
    this.load.audio('explosion', 'assets/explosion.ogg');
  }

  create(data) {
 
    this.nextTic = 0;
    let self = this;
    this.isMyTurn = false;
    this.ready = false;
    
    createWorld(this);
    createAudio(this);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.cursors = this.input.keyboard.createCursorKeys();

    socket = io({
      transportOptions: {
        polling: {
          extraHeaders: {
            'alias': data.alias
          }
        }
      }
    });
    this.otherPlayers = {};
    // TODO change group -> {}?
    // this.player = this.physics.add.group();
    // this.explosions = this.physics.add.group();

    createSocketListners(this);

    this.input.on(
      "pointermove",
      function(pointer) {
        let cursor = pointer;
        if (typeof this.playerContainer == "object" && this.playerContainer.active) {
          let mouseRotation = Phaser.Math.Angle.Between(
            cursor.x + this.cameras.main.scrollX,
            cursor.y + this.cameras.main.scrollY,
            this.playerContainer.x,
            this.playerContainer.y
            );
          mouseAngle = Phaser.Math.RAD_TO_DEG*mouseRotation - 180;
        }
      },
      this
    );
  }

  update(time, delta) {
    // if (keyX.isDown) {
    //   console.log("type of playerCotainer ", typeof this.playerContainer);
    //   console.log("isMyTurn: ", this.isMyTurn);
    //   console.log("ready: ", this.ready);
    //   console.log("this: ", this);
    //   console.log("allowedToEmit: ", allowedToEmit);
    // }

    // if (keyD.isDown && allowedToForce) {
    //   allowedToForce = false;
    //   socket.emit("forceStart");
    //   this.ready = true;
    //   setTimeout(function() {
    //     allowedToForce = true;
    //   }, 1000);
    // }
    if (!this.ready) {
      if (keyR.isDown) {
        this.ready = true;
        if(this.highCenterText){

          this.highCenterText.destroy();
        }
        socket.emit("clientReady");
      }
      return;
    }

    if ( this && 
      typeof this.playerContainer !== "undefined" && this.playerContainer.body && this.playerContainer.active
    ) {
      if (this.isMyTurn ) {
        this.playerContainer.setWeaponAngle(mouseAngle);
        if(this.playerContainer.fuel > 0){
          movePlayer(this, time, delta);
        }
        playerShot(this, time, delta);
      }
      
      let prevPos = this.playerContainer.getPrevPos(); 
      let currPos = this.playerContainer.getCurrentPos();
      if (prevPos) {
        if (
          diffValue(currPos.x, prevPos.x, 1)||
          diffValue(currPos.y, prevPos.y, 1) ||
          currPos.angle !== prevPos.angle
          ) {
          socketEmit(
            "playerMovement",
            {
              x: currPos.x,
              y: currPos.y,
              angle: currPos.angle,
            },
            true
          );
        }

        if(diffValue(currPos.turretAngle, prevPos.turretAngle, 2)){
          socketEmit("turretMoved", currPos.turretAngle);

        }

      }
      // save old position data
      this.playerContainer.setPrevPos(currPos);

      if (this.playerContainer.body.velocity.x > 1) {
        this.emitter.startFollow(this.playerContainer, -30, 8);
        this.playerContainer.setFlipX(false);
        this.emitter.on = true;

      } else if (this.playerContainer.body.velocity.x < -1) {
        this.emitter.startFollow(this.playerContainer, 30, 8);
        this.playerContainer.setFlipX(true);
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
  scene: [MainMenu, GameScene],
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin, // The plugin class
        key: "GameScene", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
        mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
      }
    ]
  }
};

var game = new Phaser.Game(config);
