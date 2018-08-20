

const nengi = require('../nengi')
const nengiConfig = require('../common/nengiConfig')
const TestUser = require('../common/entity/TestUser')
const Identity = require('../common/message/Identity')
const ServerProcessor = require('./ServerProcessor')


const webConfig = { port: 8079 }

// 绑定 entity. 取消息
class GameInstance {
    constructor() {
        this.serverProcessor = new ServerProcessor(this)
        this.players = new Map()
        this.instance = new nengi.Instance(nengiConfig, webConfig)
        this.instance.onConnect((client, clientData, callback) => {
            // create a entity for this client
            let entity = new TestUser(clientData.fromClient.x,clientData.fromClient.y)
            this.instance.addEntity(entity)
            // tell the client which entity it controls (the client will use this to follow it with the camera)
            this.instance.message(new Identity(entity.id), client)          //
            // establish a relation between this entity and the client
            entity.client = client
            client.entity = entity
            // define the view (the area of the game visible to this client, all else is culled)
            client.view = {
                x: clientData.fromClient.x,
                y: clientData.fromClient.y,
                halfWidth: clientData.fromClient.cameraWidth*1.5,
                halfHeight: clientData.fromClient.cameraHeigth*1.5
            }

            this.players.set(entity.id, entity)

            console.log(entity.id + "have connected")

            callback({ accepted: true, text: 'Welcome!' })
            //console.log(entity)
            this.serverProcessor.sendLocalSignal(entity.x, entity.y ,true)

        })

        this.instance.onDisconnect(client => {
            console.log(client.entity.id + 'have disconnect')
            this.instance.removeEntity(client.entity)
            this.players.delete(client.entity.id)
        })
    }

    update(delta, tick, now){
        this.acc += delta
        let cmd = null
        while (cmd = this.instance.getNextCommand()) {
            var tick = cmd.tick
            var client = cmd.client
            for (var i = 0; i < cmd.commands.length; i++) {
                var command = cmd.commands[i]
                if (command.protocol.name === 'MoveCommand') {
                    this.serverProcessor.moveCommand(client,command);
                }
                else if (command.protocol.name === 'PlayerDeadCommand') {
                    this.serverProcessor.playerDeadCommand(client, command)
                }
                else if(command.protocol.name === 'Te') {
                    this.serverProcessor.sendLocalMessage(client,command)
                }
            }
        }

        // TODO: the rest of the game logic
        this.instance.clients.forEach(client => {
            client.view.x = client.entity.x
            client.view.y = client.entity.y
        })

        this.instance.update()
        // to
    }
}


module.exports = GameInstance
