Game.Mainmenu = function(game) {

};

var menuscreen;

Game.Mainmenu.prototype = {
    preload: function (game) {
        this.load.image("button", "assets/buttonstolen.png");
        this.load.image("menubackground", "assets/menustolen.jpg");
    },

    create: function (game) {
        this.createButton(game, game.world.centerX, game.world.centerY + 32, 200, 100, "Start Game", 
        function(){
            this.state.start("game");
        })

        this.createButton(game,game.world.centerX, game.world.centerY + 192, 200, 100, "Exit", 
        function(){
            Console.log("Exit!");
        })

        menuscreen = this.game.add.sprite(game.world.centerX, game.world.centerY - 192, 'menubackground');
        menuscreen.anchor.setTo(0.5, 0.5);

    },
    update: function (game) {

    },
    createButton: function (game, x, y, w, h, string, callback) {
        var menuButton = this.add.button(x, y, 'button', callback, this, 2, 1, 0);
        menuButton.anchor.setTo(0.5, 0.5);
        menuButton.width = w;
        menuButton.height = h;


        var menuButtonText = this.add.text(menuButton.x, menuButton.y, string, {
            font:"14px Arial",
            fill: "#fff",
            align: "center"
        });
        menuButtonText.anchor.setTo(0.5, 0.5);
        

    }

};







