const nengi = require('../nengi')
const nengiConfig = require('../common/nengiConfig')
const ClientProcessor = require('./ClientProcessor')

const interpDelay = 100

class GameClient {
    constructor(gameObject,connectData) {

        this.clientProcessor = new ClientProcessor(this,gameObject);

        this.client = new nengi.Client(nengiConfig, interpDelay)

        this.client.onConnect(res => {
            console.log('onConnect response:', res)
    })

        this.client.onTransfer(clientData => {
            console.log('client transfer', clientData)

    })

        this.client.onClose(() => {
            console.log('connection  closed')

    })

        this.client.connect('ws://localhost:8079', connectData)
    }

    update(delta, tick, now) {

        /* receiving */
        let network = this.client.readNetwork()
        network.entities.forEach(snapshot => {
            snapshot.createEntities.forEach(entity => {
                this.clientProcessor.createEntity(entity);
              })

            snapshot.updateEntities.forEach(update => {
                this.clientProcessor.updateEntities(update, delta);
           })
            snapshot.deleteEntities.forEach(id => {
                this.clientProcessor.deleteEntities(id);
              })
         })
        // message 的引用中含 自定义结构体 和 附加 protocol
        network.messages.forEach(message => {
            this.clientProcessor.processMessage(message);
         })
        network.localMessages.forEach(localMessage => {
            //console.log('client have received the signal')
            //console.log(localMessage)
            this.clientProcessor.processLocalMessage(localMessage)
        })
        /* * */
        /* sending */
        this.clientProcessor.processUpdate(delta)
        /* * */
        /* * */
    }
}
module.exports = GameClient
