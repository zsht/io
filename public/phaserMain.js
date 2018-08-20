


const GameClient = require('../client/GameClient')
const GameObject = require('./GameObject')

const VELOCITY =  150;                // 越小越好， 那么我们将camera 区域变小
const TICKCOUNT =  1;                // 越小越好 ,负担越大
var cursors;
var gameObject;
var gameClient;
var tick = 0;

var sceneMain = new Phaser.Class(
{
    Extends: Phaser.Scene,
    initialize:
    function sceneMain() {
    Phaser.Scene.call(this, { key: 'sceneMain' });
    },

    preload : function() {
        this.load.image('circle', 'assets/circle.png');
        this.load.image('body', 'assets/body.png')
        this.load.image('sword', 'assets/sword.png')
        this.load.image('hole', 'assets/hole.png')
        this.load.spritesheet('walkLeft', 'assets/walkLeft.png', { frameWidth: 32, frameHeight: 32, });
        this.load.spritesheet('walkRight', 'assets/walkRight.png', { frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('walkDown', 'assets/walkDown.png', { frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('walkUp', 'assets/walkUp.png', { frameWidth: 32, frameHeight: 32});
    },

    create: function() {
        this.cameras.main.setBounds(0, 0, 800*2, 600*2);
        this.physics.world.setBounds(0, 0, 800*2 , 600*2);
        //animation
        this.anims.create({
            key: 'walkDown',
            frames: this.anims.generateFrameNumbers('walkDown', { start:0, end:2 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'walkRight',
            frames: this.anims.generateFrameNumbers('walkRight', { start:0, end:2 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'walkUp',
            frames: this.anims.generateFrameNumbers('walkUp', { start:0, end:2 }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'walkLeft',
            frames: this.anims.generateFrameNumbers('walkLeft', { start:0, end:2 }),
            frameRate: 5,
            repeat: -1
        });
        //create Object

        gameObject =new GameObject(this);


        // transfer the init of player to server
        var connectData = {
            x: gameObject.player.x,
            y: gameObject.player.y,
            cameraWidth: 800,
            cameraHeigth: 600
        }

        if(gameClient == undefined) {
            gameClient = new GameClient(gameObject,connectData)
            gameObject.gameClient = gameClient;
        }


        //score of you
        cursors = this.input.keyboard.createCursorKeys();
        this.score = 0;
        this.scoreText = this.add.text(16,16,'score: 0').setScrollFactor(0);

    },

     update: function (time, delta) {
        if(gameObject.player !== null && gameObject.player !==  undefined){
            var body = gameObject.player.getByName('body');
            var hole = gameObject.player.getByName('hole')
            var sword = gameObject.player.getByName('sword')
            var kill = gameObject.player.getData('kill')

            var scale

            if (2+kill*0.2 <= 10) {
                scale = 2 + kill*0.2;
            } else {
                scale = 10;
            }

            hole.scale = scale;

            gameObject.player.body.setVelocity(0);
            if (cursors.left.isDown) {
                gameObject.player.body.setVelocityX(-VELOCITY);
                body.anims.play('walkLeft',true)

                this.tweens.add({
                    targets: [sword],
                    angle: 180,
                    ease: 'Sine.In',
                    duration: delta,
                    repeat: 0
                })
                hole.x =-(64 + scale * 32);
                hole.y = 0;
            }
            else if (cursors.right.isDown) {
                gameObject.player.body.setVelocityX(VELOCITY);
                body.anims.play('walkRight',true)
                this.tweens.add({
                    targets: [sword],
                    angle: 0,
                    ease: 'Sine.In',
                    duration: delta,
                    repeat: 0
                })
                hole.x = (64 + scale*32)
                hole.y = 0
            }

            if (cursors.up.isDown) {
                gameObject.player.body.setVelocityY(-VELOCITY);
                body.anims.play('walkUp',true)
                this.tweens.add({
                    targets: [sword],
                    angle: 270,
                    ease: 'Sine.In',
                    duration: delta,
                    repeat: 0
                })
                hole.x = 0;
                hole.y = -(64+32*scale)
            }
            else if (cursors.down.isDown) {
                gameObject.player.body.setVelocityY(VELOCITY);
                body.anims.play('walkDown',true)

                this.tweens.add({
                    targets: [sword],
                    angle: 90,
                    ease: 'Sine.In',
                    duration: delta,
                    repeat: 0
                })
                hole.x = 0;
                hole.y = 64+32*scale;
            }
            tick ++ ;
            if(tick % TICKCOUNT === 0){
                gameObject.destroyPlayer()
                gameClient.update(delta);
            }
        }

        // play anim of other
         gameObject.players.getAll().forEach ((player) => {
             let play = player.getByName('body')
             if (play.getData('anim') === 0){
                 play.anims.play('walkUp',true)
             }
             else if (play.getData('anim') === 1) {
                 play.anims.play('walkRight',true)
             }
             else if (play.getData('anim') === 2) {
                 play.anims.play('walkDown',true)
             }
             else if (play.getData('anim') === 3) {
                 play.anims.play('walkLeft',true)
             }
         })


     }
})

var sceneStart = require('./phaserScene')
var config = {
    type: Phaser.AUTO,
    backgroundColor: '#202826',
    physics: {
        default: 'arcade',
        arcade: {
            //debug: true
        }
    },
    scene:  [sceneStart,sceneMain]
};
var game = new Phaser.Game(config);
