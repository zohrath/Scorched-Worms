console.log("In main.js!");

var menuscreen;

class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
  }

  preload() {
    if (skipMenu) {
      this.scene.start("GameScene");
    }
    this.load.image("button_black", "assets/button_black.png");
    this.load.image("menubackground", "assets/background_menu_vulcano.png");
  }

  create() {
    this.createButton(game, 512, 500 - 2, 200, 100, "Start Game", function() {
      let playeralias = this.getPlayerAlias();
      if (playeralias != false) {
        this.scene.start("GameScene", { alias: playeralias });
      }
    });

    this.createButton(game, 512, 500 + 92, 200, 100, "Help", function() {
      alert("There will be instructions here at some point.");
      console.log("Help!");
    });

    this.createButton(game, 512, 500 + 192, 200, 100, "Exit", function() {
      console.log();
      if (confirm('Are you sure you want to exit the game?')) {
        // Player want to exit the game.
        console.log("Exiting!"); 
        // Make the screen black and tell the user to simply close the window or tab.
      } 
    });

    menuscreen = this.add.sprite(512, 384, "menubackground").setDepth(0);

    menuscreen.setOrigin(0.5, 0.5);
  }

  getPlayerAlias() {
    var username = prompt("Please enter your alias: ", "Anon");
    while (username == "") {
      username = prompt("You need to enter a valid alias. Try again!", "Anon");
      if (username == null) {
        return false;
      }
    }
    return username;
  }

  createButton(game, x, y, w, h, string, callback) {
    var menuButton = this.add
      .sprite(x, y, "button_black")
      .setInteractive()
      .setDepth(1);
    menuButton.setOrigin(0.5, 0.5);
    menuButton.setScale(1.5);
    /* menuButton.width = w;
        menuButton.height = h;
 */
    var menuButtonText = this.add
      .text(menuButton.x, menuButton.y, string, {
        font: "26px Arial",
        fill: "#fff",
        align: "center"
      })
      .setDepth(2);
    menuButtonText.setOrigin(0.5, 0.5);
    menuButton.on("pointerdown", callback, this);
  }
}

// function getPlayerAlias(self) {
//     var username = prompt("Please enter your alias: ", "Anon");
//     console.log(username);
//     self.scene.start("GameScene");
// };

/* function startGame (scene) {
    console.log("Starting game scene!");
    scene.scene.start('GameScene');
}

function exitGame () {
    console.log("You can't exit this game :((");
} */
