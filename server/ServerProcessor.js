
const Identity = require('../common/message/Identity')
const TestLocalMessage = require('../common/message/TestLocalMessage')
const TestMessage = require('../common/message/TestMessage')
const TestUser = require('../common/entity/TestUser')
const Signal = require('../common/message/Signal')
const PlayerDeadLocalMessage = require('../common/message/PlayerDeadLocalMessage')
// 将要处理的消息进行处理更新

//todo: ServerProcessor
class ServerProcessor{
    constructor(server) {
        this.server = server
    }
    //server send message to  client
    sendMessage(client,command) {

    }
    //server send localMessage(have x, y) to client
    sendLocalMessage(client,command) {
    }
    moveCommand(client, command){
        let entity = this.server.players.get(client.entity.id)
        if(entity !== undefined){
            entity.x = command.x;
            entity.y = command.y;
            entity.anim = command.anim;
            entity.kill = command.kill;
        }
    }

    playerDeadCommand(client, command){
        //console.log(command)
        //let player = this.server.players.get(command.killedId);
        console.log(client.entity)
        this.server.instance.addLocalMessage(
            new PlayerDeadLocalMessage(client.entity.x,client.entity.y,command.id,command.killedId))
        // add the scale of the id
        //todo: debug;
        let id = command.id;
        this.server.players.get(id).kill ++;

    }

    sendLocalSignal(x,y,a) {
        var requireSnapShot = a;
        if (requireSnapShot === undefined) {
            requireSnapShot = false;
        }
        //console.log(requireSnapShot)
        var signal = new Signal(x, y, requireSnapShot)

        this.server.instance.addLocalMessage(signal);
    }


}

module.exports = ServerProcessor