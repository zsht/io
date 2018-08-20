var http = require('http')
var WebSocketServer = require('uws').Server
var WebSocket = require('ws')
var EDictionary = require('../../external/EDictionary')
var Historian = require('./Historian')
var IdPool = require('./IdPool')
var compareArrays = require('./compareArrays')
var proxify = require('../protocol/proxify')
var compare = require('../protocol/compare')
var copyProxy = require('../protocol/copyProxy')
var Binary = require('../binary/Binary')
var BinaryType = require('../binary/BinaryType')
var formatUpdates = require('../snapshot/entityUpdate/formatUpdates')
var chooseOptimization = require('../snapshot/entityUpdate/chooseOptimization')
var ProtocolMap = require('../protocol/ProtocolMap')
var Client = require('./Client')
var createSnapshotBuffer = require('../snapshot/writer/createSnapshotBuffer')
var readCommandBuffer = require('../snapshot/reader/readCommandBuffer')

var createConnectionResponseBuffer = require('../snapshot/writer/createConnectionResponseBuffer')
var createTransferClientBuffer = require('../snapshot/writer/createTransferClientBuffer')
var createTransferRequestBuffer = require('../snapshot/writer/createTransferRequestBuffer')
var createTransferResponseBuffer = require('../snapshot/writer/createTransferResponseBuffer')

var createHandshakeBuffer = require('../snapshot/writer/createHandshakeBuffer')


var TransferRegister = require('./TransferRegister')
var compareArrays = require('./compareArrays')
var uuidv4 = require('uuid/v4')

var consoleLogLogo = require('../common/consoleLogLogo')

var metaConfig = require('../common/metaConfig')
var NoInterpsMessage = require('../common/NoInterpsMessage')

//const Components = require('./Components')

class Instance {
    constructor(config, config2) {
        this.config = config
        this.transferPassword = config2.transferPassword
        this.protocols = new ProtocolMap(config, metaConfig)
       
        // console.log(this.protocols.lookupByProtocol.entries().next().value[0])

        this.transferRegister = new TransferRegister()

        this.tick = 0
        
        this.clientId = 0
        this.entityId = 0
        this.eventId = 0

        this.entityIdPool = new IdPool(config.ID_BINARY_TYPE)

        this.pendingClients = new Map()
        this.clients = new EDictionary()
        this.entities = new EDictionary()

        this.localEvents = []

        this.proxyCache = {}

        //this.components = new Components(this)
   
        this.historian = new Historian(config.UPDATE_RATE)

        this.commands = []

        this.transferCallback = null
        this.connectCallback = null
        this.disconnectCallback = null

        // created by invoking listen
        this.httpServer = null
        this.wsServer = null

        this.noInterps = []

        this.transfers = {}

        consoleLogLogo()

        if (typeof config2.port !== 'undefined') {
            this.wsServer = new WebSocketServer({ port: config2.port })
        } else if (typeof config2.httpServer !== 'undefined') {
            this.wsServer = new WebSocketServer({ server: config2.httpServer })
        } else {
            throw new Error('Instance must be passed a config that contains a port or an http server before invoking listen.')
        }        

        this.wsServer.on('connection', ws => {

            var client = this.connect(ws)
            ws.on('message', message => {
                this.onMessage(message, client)
            })

            ws.on('close', (event) => {
                this.disconnect(client, event)
            })
        })

    }

    noInterp(id) {
        this.noInterps.push(id)
    }



    transfer(client, serverAddress, clientTransferOptions, callback) {
        var bitBuffer = createTransferRequestBuffer(this.transferPassword, clientTransferOptions)

        var wsClient = new WebSocket(serverAddress)

        wsClient.on('open', () => {
            wsClient.send(bitBuffer.byteArray)
        })

        wsClient.on('message', message => {
            var commandMessage = readCommandBuffer(message, this.protocols, this.config)
            if (commandMessage.transferResponse !== -1) {
                if (commandMessage.transferResponse.password === this.transferPassword) {
                    if (commandMessage.transferResponse.approved) {
                        var bitBuffer = createTransferClientBuffer(commandMessage.transferResponse.transferKey, serverAddress)
                        client.connection.send(bitBuffer.byteArray)
                        callback({ accepted: true })
                        //return
                    }
                } else {
                    callback({ accepted: false, reason: 'Wrong transfer password.' })
                    //return
                }
            }

            callback({ accepted: false, reason: 'Tranfer failed for unknown reason.' })
            //return
        })

        wsClient.on('error', err => {
            callback({ accepted: false, reason: 'Unable to reach server.', error: err })
            //return
        })
    }


    onTransfer(callback) {
        this.transferCallback = callback
    }

    onMessage(message, client) {
        try {
            var commandMessage = readCommandBuffer(message, this.protocols, this.config)
        } catch (err) {
            if (err) {
                //console.log('onMessage error, disconnecting client')
                this.disconnect(client)
                //console.log(err.stack)
                this.pendingClients.delete(client.connection)
            }
            return
        }

        if (commandMessage.transferRequest !== -1) {
            if (commandMessage.transferRequest.password === this.transferPassword) {
                var token = uuidv4()
                this.transferRegister.add(token, commandMessage.transferRequest.data)
                var bitBuffer = createTransferResponseBuffer(this.transferPassword, true, token)
                client.connection.send(bitBuffer.byteArray)
            }
        }

        if (commandMessage.handshake !== -1) {
            if (typeof this.connectCallback === 'function') {
                var clientData = {
                    fromClient: commandMessage.handshake,
                    fromTransfer: null
                }
                if (commandMessage.handshake.transferKey) {
                    clientData.fromTransfer = this.transferRegister.get(commandMessage.handshake.transferKey).data
                    this.transferRegister.delete(commandMessage.handshake.transferKey)
                }

                this.connectCallback(client, clientData, response => {
                    if (typeof response === 'object') {
                        if (response.accepted) {
                            this.acceptConnection(client, response.text)
                        } else {
                            this.denyConnection(client, response.text)
                        }
                    }
                })
            }
        }

        if (!client.accepted) {
            return
        }        

        if (commandMessage.pong !== -1) {
            client.latencyRecord.receivePong(commandMessage.pong)
            return // exit early,  message with PONG has nothing else of interest
        }

        client.lastReceivedDataTimestamp = Date.now()

        this.commands.push({ 
            tick: commandMessage.tick,
            pong: commandMessage.pong,
            client: client, 
            commands: commandMessage.commands 
        })
    }

    getNextCommand() {
        var cmd = this.commands.shift()
        //console.log(cmd)
        if (cmd && cmd.client.lastProcessedClientTick < cmd.tick) {
            cmd.client.lastProcessedClientTick = cmd.tick
        }    
        return cmd
    }

    onConnect(callback) {
        this.connectCallback = callback
    }

    acceptConnection(client, text) {
        this.pendingClients.delete(client.connection)
        this.addClient(client)
        client.accepted = true

        var bitBuffer = createConnectionResponseBuffer(true, text)
        var buffer = bitBuffer.toBuffer()

        if (client.connection.readyState === 1) {
            client.connection.send(buffer,  { binary: true })
        }
    }

    denyConnection(client, text) {
        this.pendingClients.delete(client.connection)

        var bitBuffer = createConnectionResponseBuffer(false, text)
        var buffer = bitBuffer.toBuffer()

        if (client.connection.readyState === 1) {
            client.connection.send(buffer,  { binary: true })
            client.connection.close()
        }
    }

    connect(connection) {
        var client = new Client()
        client.connection = connection
        this.pendingClients.set(connection, client)
        return client
    }

    onDisconnect(callback) {
        this.disconnectCallback = callback
    }


    disconnect(client, event) {
        if (this.clients.get(client.id)) {
            client.id = -1
            client.instance = null
            this.clients.remove(client)
            if (typeof this.disconnectCallback === 'function') {
                this.disconnectCallback(client, event)
            }
            client.connection.close()
        }
        return client
    }

    addClient(client) {
        client.id = this.clientId++
        client.instance = this
        this.clients.add(client)
        return client
    }

    getClient(id) {
        return this.clients.get(id)
    }

    addEntity(entity) {
        if (!entity.protocol) {
            throw new Error('Object is missing a protocol or protocol was not supplied via config.')
        }
        entity[this.config.ID_PROPERTY_NAME] = this.entityIdPool.nextId()
        //entity.protocol = this.protocols.getProtocol(entity.type)
        entity[this.config.TYPE_PROPERTY_NAME] = this.protocols.getIndex(entity.protocol)
        this.entities.add(entity)
    
        //this.components.addEntity(entity)
        return entity
    }

    getEntity(id) {
        return this.entities.get(id)
    }



    removeEntity(entity) {
        //this.components.removeEntity(entity)

        this.entityIdPool.queueReturnId(entity.id)
        entity.id = -1
        this.entities.remove(entity)

        return entity
    }

    addComponent(c) {
        //this.components.addComponent(c)
    }

    removeComponent(c) {
        //this.components.removeComponent(c)
    }

    addLocalMessage(lEvent) {
        if (!lEvent.protocol) {
            throw new Error('Object is missing a protocol or protocol was not supplied via config.')
        }

        lEvent[this.config.ID_PROPERTY_NAME] = this.eventId++
        lEvent[this.config.TYPE_PROPERTY_NAME] = this.protocols.getIndex(lEvent.protocol)
        this.localEvents.push(lEvent)
        return lEvent
    }

    message(message, clientOrClients) {
        if (!message.protocol) {
            throw new Error('Object is missing a protocol or protocol was not supplied via config.')
        }
        message[this.config.TYPE_PROPERTY_NAME] = this.protocols.getIndex(message.protocol)
        if (Array.isArray(clientOrClients)) {
            clientOrClients.forEach(client => {
                client.queueMessage(message)
            })
        } else {
            clientOrClients.queueMessage(message)
        }
        return message
    }

    messageAll(message) {
        this.message(message, this.clients.toArray())
    }

    sendJSON(json, clientOrClients) {
        var payload = (typeof json === 'string') ? json : JSON.stringify(json)

        if (Array.isArray(clientOrClients)) {
            clientOrClients.forEach(client => {
                client.queueJSON(payload)
            })
        } else {
            clientOrClients.queueJSON(payload)
        }
        return payload
    }

    proxifyOrGetCachedProxy(tick, entity) {
        if (this.proxyCache[tick].entities[entity.id]) {
            return this.proxyCache[tick].entities[entity.id]
        } else {
            if (!entity.protocol) {
              console.log('PROBLEM Entity/Component:', entity)
              throw new Error('nengi encountered an entity without a protocol. Did you forget to attach a protocol to an entity or list it in the config? Did you add an entity to the instance that was never supposed to be networked?')
            }
            var proxy = proxify(entity, entity.protocol)
            this.proxyCache[tick].entities[entity.id] = proxy

            if (this.proxyCache[tick-1]) {
                
                var proxyOld = this.proxyCache[tick-1].entities[entity.id]
                if (proxyOld) {
                    proxy.diff = chooseOptimization(
                        this.config.ID_PROPERTY_NAME, 
                        proxyOld, 
                        proxy, 
                        entity.protocol
                    )
                }
            }

            return proxy
        }
    }

    update() {
        this.transferRegister.update()
        this.historian.record(this.tick, this.entities.toArray(), this.localEvents)
        this.localEvents = []


        //this.components.process()

        var spatialStructure = this.historian.getCurrentState()  

        var now = Date.now()
        var clients = this.clients.toArray()

        for (var i = 0; i < clients.length; i++) {
            var client = clients[i]            

            var snapshot = this.createSnapshot(this.tick, client, spatialStructure,  now)
            var bitBuffer = createSnapshotBuffer(snapshot, this.config)
            var buffer = bitBuffer.toBuffer()

            if (client.connection.readyState === 1) {
                client.connection.send(buffer,  { binary: true })
                //client.saveSnapshot(snapshot, this.protocols)
            }    
        }
         
        delete this.proxyCache[this.tick-20]

        //this.components.clear()
        this.noInterps = []
        this.entityIdPool.update()
        this.tick++        
    }

    checkVisibility(client, entityIds) {
        // compares the list of previously visible entities to the currently visible
        var diffs = compareArrays(client.entityIds, entityIds)

        // updates the list of previously visible entities
        client.entityIds = entityIds

        return {
            noLongerVisible: diffs.aOnly,
            stillVisible: diffs.both,
            newlyVisible: diffs.bOnly
        }
    }


    createSnapshot(tick, client, spatialStructure, now) {
        //console.log('CREATE SNAPSHOT')
        if (typeof this.proxyCache[tick] === 'undefined') {
            this.proxyCache[tick] = {
                entities: {},
            }
        }

        var now = Date.now()

        // when timestamp is -1, no timesync is sent to the client
        //console.log(tick, tick % 100)
        var timestamp = (tick % this.config.UPDATE_RATE === 0) ? now : -1

        if (client.lastReceivedTick === -1) {
            timestamp = now
        }
        client.lastReceivedTick = tick


        //console.log('createSnapshot timestamp', timestamp)
        var avgLatency = Math.round(client.latencyRecord.averageLatency)
        //console.log('########', avgLatency)
        if (avgLatency > 999) {
            avgLatency = 999
        } else if (avgLatency < 0) {
            avgLatency = 0
        }
        
        var snapshot = {
            tick: tick,
            clientTick: client.lastProcessedClientTick,

            pingKey: client.latencyRecord.generatePingKey(),
            avgLatency: avgLatency,
            timestamp: timestamp,
            transferKey: client.transferKey,

            engineMessages: [],
            localEvents: [],
            messages: [],
            jsons: [],
            createEntities: [],
            deleteEntities: [],
            updateEntities: {
                full: [],
                partial: [],
                optimized: []
            }
        }

        //this.components.snapshotDecorate(snapshot)

        if (client.transferKey !== -1) {
            client.transferKey = -1
        }

        for (var i = 0; i < client.messageQueue.length; i++) {
            snapshot.messages.push(client.messageQueue[i])
        }
        client.messageQueue = []

        client.jsonQueue.forEach(json => {
            snapshot.jsons.push(json)
        })
        
        client.jsonQueue = []

        var vision = client.checkVisibility(spatialStructure)
        //console.log('vision', vision)


        // entity create
        for (var i = 0; i < vision.newlyVisible.length; i++) {            
            let id = vision.newlyVisible[i]
            let entity = this.getEntity(id)
            let proxy = this.proxifyOrGetCachedProxy(tick, entity)
            proxy.protocol = entity.protocol
            //Object.freeze(proxy)
            snapshot.createEntities.push(proxy)

            //this.components.snapshotCreateEntity(entity, snapshot, tick)
        }

        var tempNoInterps = []
        for (var i = 0; i < vision.stillVisible.length; i++) {
            let id = vision.stillVisible[i]
            
            let entity = this.getEntity(id)
            let proxy = this.proxifyOrGetCachedProxy(tick, entity)
            //var proxyOld = client.entityCache.getEntity(id)

            let formattedUpdates = proxy.diff

            for (var j = 0; j < formattedUpdates.singleProps.length; j++) {
                var singleProp = formattedUpdates.singleProps[j]
                snapshot.updateEntities.partial.push(singleProp)
            }

            //this.components.snapshotUpdateEntity(entity, snapshot, tick)

            if (this.noInterps.indexOf(id) !== -1) {
                tempNoInterps.push(id)
            }
        }

        if (tempNoInterps.length > 0) {
            var msg = new NoInterpsMessage(tempNoInterps)
            msg.protocol = this.protocols.getMetaProtocol(msg.type)
            snapshot.engineMessages.push(msg)
        }

        // entity delete
        for (var i = 0; i < vision.noLongerVisible.length; i++) {
            snapshot.deleteEntities.push(vision.noLongerVisible[i])
            let entity = this.getEntity(vision.noLongerVisible[i])
            //this.components.snapshotDeleteEntity(entity, snapshot)
        }


        snapshot.localEvents = vision.events
        //console.log('snapshot', snapshot)
        return snapshot
    }
}

module.exports = Instance