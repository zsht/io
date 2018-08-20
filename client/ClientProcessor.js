
const TestUser = require('../common/entity/TestUser')
const MoveCommand = require('../common/command/MoveCommand')
const PlayerDeadCommand = require('../common/command/PlayerDeadCommand')


// 到时重构将类变成单例模式
class ClientProcessor {
    constructor(gameClient, gameObject) {
        //transfer the data from gameClient
        this.gameClient = gameClient
        //the object of scene
        this.gameObject = gameObject
    }

    // myEntity  view
    createEntity(entity){
        if(entity.protocol.name === 'TestUser') {
            if(entity.id !== this.gameObject.player.name) {  // 跳过自身，使用局部流畅处理
                let clientEntity = new TestUser(entity.x, entity.y)
                this.gameObject.createPlayer(entity.id, clientEntity)
            }
        }
    }


    //todo: clientProcessor
    updateEntities(update, delta) {
        let  player = this.gameObject.players.getByName(update.id)
        if(update.id !== this.gameObject.player.name
        || this.gameObject.players.getByName(update.id) != null) {
            // update the body anim number

            if(update.prop === 'anim'){
                //todo: console
                player.setData('anim', update.value);
            }
            else if(update.prop === 'kill') {
                // noinspection JSAnnotator
                player.setData('kill',update.value);
                console.log(update)
            }
            else {
                this.gameObject.updateOtherPlayer(player, update, delta)
            }



        }
    }
    deleteEntities(id){
        let player = this.gameObject.players.getByName(id)
        if (player !== undefined) {
            // 断开连接， 从map中删除
            this.gameObject.destroyQueue.push(id)
        }
    }

    processMessage(message){
        if(message.protocol.name === 'Identity') {
            this.gameObject.player.name = message.entityId;
        }
    }
    processLocalMessage(message){
        if(message.protocol.name === 'Signal') {

            if(message.REQUIRE_SNAPSHOT  === true){
                this.gameClient.client.addCommand(
                    new MoveCommand(this.gameObject.player.x+1, this.gameObject.player.y+1,
                        this.gameObject.player.getByName('body').getData('anim')))

                this.gameClient.client.update()
            }
        }
        else if(message.protocol.name === 'PlayerDeadLocalMessage'){
            //this.deleteEntities(message.id);
            if(message.id !== this.gameObject.player.name){
                this.gameObject.destroyQueue.push(message.killedId);
            }
        }
    }

    sendPlayerDeadCommand(id, killedId) {
        this.gameClient.client.addCommand(new PlayerDeadCommand(id,killedId))
        this.gameClient.client.update();
    }

    //使用 phaser update 来调整更新
    processUpdate() {
        this.gameClient.client.addCommand(
            new MoveCommand(this.gameObject.player.x, this.gameObject.player.y,
                this.gameObject.player.getData('anim'),this.gameObject.player.getData('kill')
            ))
        this.gameClient.client.update();
    }
}

module.exports = ClientProcessor