
var sceneStart = require('./phaserScene')

const GameClient = require('../client/GameClient')
const GameObject = require('./GameObject')

const VELOCITY =  150;                // 越小越好， 那么我们将camera 区域变小
const  TICKCOUNT =  1;                // 越小越好 ,负担越大


var gameObject;
var gameClient;

var cursors;


var sceneMain = new Phaser.Class(
    {
        Extends: Phaser.Scene,
        initialize:
            sceneMain() {
    Phaser.Scene.call(this, { key: 'sceneMain' });
},


function preload () {
    this.load.image('circle', 'assets/circle.png');
    this.load.image('body', 'assets/body.png')
    this.load.image('sword', 'assets/sword.png')
}


function create () {
    this.cameras.main.setBounds(0, 0, 800*2, 600*2);
    this.physics.world.setBounds(0, 0, 800*2 , 600*2);

    gameObject =new GameObject(game.scene.scenes[0]);           // == this
    var connectData = {
        x: gameObject.player.x,
        y: gameObject.player.y,
        cameraWidth: 800,
        cameraHeigth: 600
    }
    gameClient = new GameClient(gameObject,connectData)

    //gameObject.player.setCollideWorldBounds(true);
    cursors = this.input.keyboard.createCursorKeys();

    // 屏幕显示级别放在屏幕里
    this.score = 0;

    this.scoreText = this.add.text(16,16,'score: 0').setScrollFactor(0);

    //this.physics.add.overlap(player, stars, collectStar, null, this)
}



tick = 0;
function update (time, delta) {

    gameObject.player.body.setVelocity(0);
    if (cursors.left.isDown)
    {
        gameObject.player.body.setVelocityX(-VELOCITY);
    }
    else if (cursors.right.isDown)
    {
        gameObject.player.body.setVelocityX(VELOCITY);
    }

    if (cursors.up.isDown)
    {
        gameObject.player.body.setVelocityY(-VELOCITY);
    }
    else if (cursors.down.isDown)
    {
        gameObject.player.body.setVelocityY(VELOCITY);
    }

    tick ++ ;
    if(tick % TICKCOUNT === 0){
        gameObject.destroyPlayer()
        gameClient.update(delta);
    }

    //gameObject.player.rotation+=0.04

    gameObject.players.getAll().forEach ((player) => {
        //player.rotation += 0.04;
    })

}




})

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    backgroundColor: '#0072bc',
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};



var game = new Phaser.Game(config);
