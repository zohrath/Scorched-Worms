let cursors;
let player;
let power = 0;
let mouseAngle = 0;
let socket;
let keyD;
let keyR;
let keyX;
let keyC;
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
    console.log("############ In create in game.js #############");
    console.log("Name:", data.alias);
    console.log("data", data);
    console.log("###############################################");
    console.log(this);
    this.nextTic = 0;
    let self = this;
    this.isMyTurn = false;
    this.ready = false;
    
    createWorld(this);
    createAudio(this);
    keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
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
        if (typeof this.playerContainer == "object") {
          mouseAngle = Phaser.Math.Angle.Between(
            this.playerContainer.turret.x,
            this.playerContainer.turret.y,
            cursor.x + this.cameras.main.scrollX,
            cursor.y + this.cameras.main.scrollY
          );
        }
      },
      this
    );
  }

  update(time, delta) {
    if (keyC.isDown) {
    }
    if (keyX.isDown) {
      console.log("type of playerCotainer ", typeof this.playerContainer);
      console.log("isMyTurn: ", this.isMyTurn);
      console.log("ready: ", this.ready);
      console.log("this: ", this);
      console.log("allowedToEmit: ", allowedToEmit);
    }

    if (keyD.isDown && allowedToForce) {
      allowedToForce = false;
      console.log("force start");
      socket.emit("forceStart");
      this.ready;
      setTimeout(function() {
        allowedToForce = true;
      }, 1000);
    }
    if (!this.ready) {
      if (keyR.isDown) {
        socket.emit("clientReady");
        this.ready = true;
      }
      return;
    }

    if ( this && 
      typeof this.playerContainer !== "undefined" && this.playerContainer.body
      //this.playerContainer.active
    ) {
      if (this.isMyTurn) {
        this.playerContainer.setWeaponAngle(mouseAngle);
        if(this.playerContainer.fuel > 0){
          movePlayer(this, time, delta);
        }
        playerShot(this, time, delta);
      }
      
      this.playerContainer.setTurretPosition();
      this.playerContainer.setPlayerTextPosition();
      let prevPos = this.playerContainer.getPrevPos(); 
      let currPos = this.playerContainer.getCurrentPos(); 
      if (prevPos) {
        if (
          Math.round(currPos.x) !== Math.round(prevPos.x) ||
          Math.round(currPos.y) !== Math.round(prevPos.y)
        ) {
          socketEmit(
            "playerMovement",
            this.playerContainer.getPlayerInfo(),
            true
          );
        }

        if (
          Math.round(this.playerContainer.getWeaponAngle()) !==
          Math.round(prevPos.turretRotation)
        ) {
          socketEmit("toOtherClients", {
            event: "moveTurret",
            turretRotation: prevPos.turretRotation
          });
        }
      }
      // save old position data
      this.playerContainer.oldPosition = {
        x: this.playerContainer.x,
        y: this.playerContainer.y,
      };
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
    // emit player movement
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
