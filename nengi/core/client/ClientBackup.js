const ProtocolMap = require('../protocol/ProtocolMap')
const readSnapshotBuffer = require('../snapshot/reader/readSnapshotBuffer')
const createCommandBuffer = require('../snapshot/writer/createCommandBuffer')
const createPongBuffer = require('../snapshot/writer/createPongBuffer')
const createHandshakeBuffer = require('../snapshot/writer/createHandshakeBuffer')
const EntityCache = require('../instance/EntityCache')
const Binary = require('../binary/Binary')
const WorldState = require('./WorldState')
const metaConfig = require('../common/metaConfig')

function Client(config, interpolator) {
    this.config = config
    this.interpolar = interpolator
    this.protocols = new ProtocolMap(config, metaConfig)

    // unconfirmedCommands is a map with clientTicks as keys
    this.unconfirmedCommands = new Map()

    this.tickLength = 1000/config.UPDATE_RATE

    this.entityCache = new EntityCache()
    this.websocket = null

    this.snapshots = []
    this.latest = null

    // a count of ticks received from the server
    this.serverTick = 0

    this.updateTick = 0

    this.onStringData = null

    this.sendQueue = {}
    this.lastSentTick = -1

    this.averagePing = 100
    this.pings = []

    this.timeDifference = -1
    this.timeDifferences = []


    this.avgDiff = 0

    this.avgDiffs = []
    this.connectionCallback = null
    this.closeCallback = null
    this.transferCallback = null

    this.messages = []
    this.localMessages = []
    this.jsons = []
}


Client.prototype.reset = function() {
    this.websocket.close()
    this.entityCache = new EntityCache()  
    this.snapshots = []
    
    this.latest = null
    this.serverTick = 0
    this.updateTick = 0

    this.sendQueue = {}
    this.lastSentTick = -1
    this.averagePing = 100
    this.pings = []
 
    this.timeDifference = -1
    this.timeDifferences = []
    this.avgDiff = 0
    this.avgDiffs = []
    
}

Client.prototype.readNetwork = function() {
    let result = this.interpolar.interpolate(this.snapshots, this.tickLength, this.avgDiff)
    result.latest = this.latest
    result.messages = this.messages.splice(0, this.messages.length)
    result.localMessages = this.localMessages.splice(0, this.localMessages.length)
    result.jsons = this.jsons.splice(0, this.jsons.length)
    return result
}

Client.prototype.onClose = function(cb) {
    this.closeCallback = cb
}

Client.prototype.onTransfer = function(cb) {
    this.transferCallback = (transferKey, address) => {
        var clientData = { transferKey: transferKey }
        cb(clientData)
        this.reset()
        this.connect(address, clientData)
    }
}

Client.prototype.onConnect = function(cb) {
    this.connectionCallback = cb
}

Client.prototype.update = function() {
    for (var i = this.lastSentTick; i < this.updateTick; i++) {
        this.sendCommands(i)
        this.lastSentTick = i
    }
    this.updateTick++
}

Client.prototype.getUnconfirmedCommands = function() {
    return this.unconfirmedCommands
}

Client.prototype.addCommand = function(command) {
    var tick = this.updateTick
    if (typeof this.sendQueue[tick] === 'undefined') {
        this.sendQueue[tick] = []        
    }
    if (!this.unconfirmedCommands.has(tick)) {
        this.unconfirmedCommands.set(tick, [])
    }
    command.type = this.protocols.getIndex(command.protocol)
    this.sendQueue[tick].push(command)
    this.unconfirmedCommands.get(tick).push(command)
}

Client.prototype.sendCommands = function(tick) {
    if (this.websocket && this.websocket.readyState === 1) {
        var commands = this.sendQueue[tick]
        if (!commands) {
            commands = []
        }
        this.websocket.send(createCommandBuffer(tick, commands).byteArray)
        delete this.sendQueue[tick]
    }
}

Client.prototype.connect = function(address, handshake) {
    this.websocket = new WebSocket(address, 'nengi-protocol')
    this.websocket.binaryType = 'arraybuffer'

    if (typeof handshake === 'undefined' || !handshake) {
        handshake = {}
    }

    this.websocket.onopen = event => {
        this.websocket.send(createHandshakeBuffer(handshake).byteArray)
    }

    this.websocket.onerror = err => {
        console.log('WebSocket error', err)
    }

    this.websocket.onclose = () => {
        if (this.closeCallback) {
            this.closeCallback()
        }
    }

    this.websocket.onmessage = message => {          
        if (message.data instanceof ArrayBuffer) {
            
            var snapshot = readSnapshotBuffer(
                message.data,
                this.protocols, 
                this.entityCache,
                this.config,
                this.connectionCallback,
                this.transferCallback
            )
            // some messages aren't snapshots (connection & transfer)
            if (!snapshot) {
                return
            }

            this.messages = this.messages.concat(snapshot.messages)
            this.localMessages = this.localMessages.concat(snapshot.localMessages)
            this.jsons = this.jsons.concat(snapshot.jsons)

            if (snapshot.pingKey !== -1) {
                var pongBuffer = createPongBuffer(snapshot.pingKey)
                this.websocket.send(pongBuffer.byteArray)
            }
            if (snapshot.avgLatency !== -1) {
                this.averagePing = snapshot.avgLatency
            }            

            var worldState = new WorldState(this.serverTick, this.tickLength, snapshot, this.latest)

            this.avgDiffs.push(Date.now() - worldState.timestamp)

            var total = 0
            for (var i = 0; i < this.avgDiffs.length; i++) {
                total += this.avgDiffs[i]
            }
            this.avgDiff = total / this.avgDiffs.length
  
            this.timeDifferences.push(Date.now() - worldState.timestamp - (0.5 * this.averagePing))

            var total = 0
            for (var i = 0; i < this.timeDifferences.length; i++) {
                total += this.timeDifferences[i]
            }
            this.timeDifference = total / this.timeDifferences.length
            while (this.timeDifferences.length > 20) {
                this.timeDifferences.shift()
            }
                
            this.latest = worldState

            this.unconfirmedCommands.forEach((command, key) => {
                if (key <= this.latest.clientTick) {
                    this.unconfirmedCommands.delete(key)
                }
            })

            this.snapshots.push(worldState)
            this.serverTick++

            if (this.snapshots[this.snapshots.length-20]) {
                if (this.snapshots[this.snapshots.length-20].processed) {
                    this.snapshots.splice(this.snapshots.length-20, 1)
                }
            }

        } else if (typeof message.data === 'string') {
            if (typeof this.onStringData === 'function') {
                this.onStringData(message.data)
            }
        } else {
            console.log('unknown websocket data type')
        }
    }
}

module.exports = Client