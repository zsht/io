

// 存放，所有对象与对象事件，对象间的事件
// 写成员和 函数时 前面要加上 this.scene
// 再次重构时 ,将add.sprite 换成add.object;
const  TICKCOUNT =  5;

class GameObject  {
    constructor(scene) {
        this.gameClient;   // 使用时赋值
        this.scene = scene;
        this.objectEvent = new Phaser.Events.EventEmitter();
        this.players = this.scene.add.container(0,0);           // deposit other player to find them
        this.destroyQueue = new Array();
        // the player part
        this.devil = this.scene.physics.add.sprite(0, 0, 'body')
        this.sword = this.scene.physics.add.sprite(0, 0, 'sword').setOrigin(0.18,0.5)
        this.hole = this.scene.physics.add.sprite(0,64, 'hole').setCircle(16).setScale(2).setAngularVelocity(720);
        this.devil.setName('body')
        this.sword.setName('sword')
        this.hole.setName('hole')
        // random position
        var spriteBounds = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(this.scene.physics.world.bounds), -100, -100);
        var pos = Phaser.Geom.Rectangle.Random(spriteBounds);
        // player
        this.player = this.scene.add.container(pos.x, pos.y)
        this.player.add([this.devil, this.sword, this.hole])
        this.player.setSize(32, 32);
        this.scene.physics.world.enable(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.scene.cameras.main.startFollow(this.player.body, true, 0.05, 0.05);

        this.player.setData('kill', 2);
    }


    createPlayer(key, value) {

        let body = this.scene.physics.add.sprite(0, 0, 'body')
        body.setData('anim', value.anim)
        let scale;
        if (2 + value.kill * 0.2 <= 10) {
            scale = 2 + value.kill * 0.5;
        } else {
            scale = 10;
        }
        let sword = this.scene.physics.add.sprite(0, 0, 'sword').setOrigin(0.18, 0.5)
        let hole = this.scene.physics.add.sprite(0, 64 + 32 * scale, 'hole').setCircle(16).setScale(scale).setAngularVelocity(720);
        let entity = this.scene.add.container(value.x, value.y)
        body.setName('body')

        sword.originY = 0;
        sword.setName('sword')
        hole.setName('hole')
        entity.add([body, sword, hole])
        entity.setData('kill', value.kill)
        entity.setName(key)
        entity.setSize(32, 32)
        this.scene.physics.world.enable(entity);
        entity.body.setCollideWorldBounds(true);
        this.players.add(entity)
        // add the player event
        //todo : change event
        this.interactiveEventRegister(entity)


        /*  可以放大。
        this.scene.tweens.add({
            targets: entity.getByName('sword'),
            scaleX: 5,
            scaleY: 5,
            ease: 'Sine.In',
            duration: 3000,
            yoyo: true,
            repeat: -1,
        })
        */


    }
    // update other player position and other data
    updateOtherPlayer(otherPlayer, update, delta) {
        if(typeof(otherPlayer) != undefined && this.player != undefined ) {
            var hole = otherPlayer.getByName('hole')
            var sword = otherPlayer.getByName('sword')

            sword.setOrigin(0.18,0.5)
            var prop = update.prop;
            var value = update.value;

            var scale
            var kill = this.players.getByName(update.id).getData('kill')
            if (2+kill*0.2 <= 10) {
                scale = 2 + kill*0.2;
            } else {
                scale = 10;
            }

            hole.scale = scale;


            if(prop === 'x') {
                if (otherPlayer.x < value) {
                    otherPlayer.getByName('body').setData('anim', 1);
                    //chang the sword angle

                    this.scene.tweens.add({
                        targets: [sword],
                        angle: 0,
                        ease: 'Sine.In',
                        duration: delta,
                        repeat: 0
                    })

                    hole.x = scale * 32 + 64
                    hole.y = 0;

                }
                else if(otherPlayer.x > value) {
                    otherPlayer.getByName('body').setData('anim', 3)
                    this.scene.tweens.add({
                        targets: [sword],
                        angle: 180,
                        ease: 'Sine.In',
                        duration: delta,
                        repeat: 0
                    })
                    hole.x = -(scale * 32+64);
                    hole.y = 0;
                }
            }
            else if (prop === 'y') {    // 注意x 与 y 轴
                if(otherPlayer.y < value) {
                    otherPlayer.getByName('body').setData('anim', 2)

                    this.scene.tweens.add({
                        targets: [sword],
                        angle: 90,
                        ease: 'Sine.In',
                        duration: delta,
                        repeat: 0
                    })

                    hole.x = 0;
                    hole.y = 64+scale*32
                }
                else if(otherPlayer.y > value)  {
                    otherPlayer.getByName('body').setData('anim', 0)
                    this.scene.tweens.add({
                        targets: [sword],
                        angle: 270,
                        ease: 'Sine.In',
                        duration: delta,
                        repeat: 0
                    })
                    hole.x = 0;
                    hole.y =-(64+scale*32)
                }
            }
            // update XY
            this.scene.tweens.add({
                targets: otherPlayer,
                [prop]: value,           //位置进行移动；
                ease: 'Sine.In',
                duration: delta,
                repeat: 0
            })
        }

    }

    destroyPlayer() {

        while(this.destroyQueue.length !== 0) {
            let id = this.destroyQueue.shift();
            let player
            if( this.players.getByName(id) !== undefined && this.players.getByName(id) !== null ){
                this.players.remove(player);
                this.players.getByName(id).destroy();
            }


        }
    }
    //TODO: add event
    // process the relation player and otherPlayer
    //must modify the function of clientProcessor
    interactiveEventRegister(entity){
        this.overlapEachOtherEvent(entity);
    }



    overlapEachOtherEvent(entity){
        // here sword is hole
        var myHole = this.player.getByName('hole')
        var otherBody = entity.getByName('body')
        var otherHole = entity.getByName('hole')
        var myBody = this.player.getByName('body')

        // me to other
        this.scene.physics.add.overlap(otherBody ,myHole,(body) =>{
            this.destroyQueue.push(otherBody.parentContainer.name)
            this.scene.score+=1
            this.scene.scoreText.setText('score: ' + this.scene.score)
            // 发送命令的事 交给 processor
        })
        // other to me
        this.scene.physics.add.overlap(myBody,otherHole,(body, otherHole) =>{
            let id = otherHole.parentContainer.name
            let killedId = this.player.name;
            this.gameClient.clientProcessor.sendPlayerDeadCommand(id, killedId)
            //this.player.enable = false;
            //this.player.visible =false;
            //todo: add final
            this.scene.active = 0;
            this.scene.scene.start('sceneStart')
        })
    }



};


module.exports = GameObject;