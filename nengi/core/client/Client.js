var ProtocolMap = require('../protocol/ProtocolMap')
var readSnapshotBuffer = require('../snapshot/reader/readSnapshotBuffer')
var createCommandBuffer = require('../snapshot/writer/createCommandBuffer')
var createPongBuffer = require('../snapshot/writer/createPongBuffer')
var createHandshakeBuffer = require('../snapshot/writer/createHandshakeBuffer')
var EntityCache = require('../instance/EntityCache')
var Binary = require('../binary/Binary')
var getValue = require('../protocol/getValue')

var WorldState = require('./WorldState')
const metaConfig = require('../common/metaConfig')

function Client(config, interpDelay) {
    this.config = config
    this.interpDelay = interpDelay
    this.protocols = new ProtocolMap(config, metaConfig)

    // unconfirmedCommands is a map with clientTicks as keys
    this.unconfirmedCommands = new Map()

    this.tickLength = 1000 / config.UPDATE_RATE

    this.entityCache = new EntityCache()
    this.interpCache = new EntityCache()

    this.websocket = null

    this.snapshots = []
    this.latest = null

    // a count of ticks received from the server
    this.serverTick = 0

    this.updateTick = 0

    this.lastProcessedTick = -1
    this.onStringData = null

    this.sendQueue = {}
    this.lastSentTick = 0

    this.averagePing = 100
    this.pings = []

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
    this.cache = new EntityCache()

    this.snapshots = []

    //this.latest = null
    this.serverTick = 0
    this.updateTick = 0
    this.lastProcessedTick = -1
    this.sendQueue = {}
    this.lastSentTick = 0
    this.averagePing = 100
    this.pings = []
    this.avgDiff = 0
    this.avgDiffs = []
}

Client.prototype.readNetwork = function() {
    let result = this.interpolate(this.interpDelay)
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
        //console.log('sending', i)
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

Client.prototype.findInitialSnapshot = function(renderTime) {
    for (var i = this.snapshots.length - 1; i >= 0; i--) {
        var snapshot = this.snapshots[i]
        if (snapshot.timestamp < renderTime) {
            return { snapshot: snapshot, index: i }
        }
    }
}

var lerp2 = function(a, b, portion) {
    return a + (b - a) * portion
}

function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t
}

//ar prev = Date.now()
var prev = 0
Client.prototype.interpolate = function(interpDelay) {
    var renderTime = Date.now() - interpDelay - this.avgDiff
    prev = renderTime

    var late = []

    var snapshotOlderIndex = null
    var snapshotNewer = null
    var snapshotOlder = null

    var initialSnapshotData = this.findInitialSnapshot(renderTime)

    if (initialSnapshotData) {
        snapshotOlder = initialSnapshotData.snapshot
        snapshotOlderIndex = initialSnapshotData.index
    }

    if (snapshotOlder) {
        var olderTick = snapshotOlder.tick
        for (var i = 0; i < this.snapshots.length; i++) {
            var tempSnapshot = this.snapshots[i]
            if (tempSnapshot.tick === olderTick + 1) {
                snapshotNewer = tempSnapshot
            }
        }

        var iSnapshot = {
            createEntities: [],
            deleteEntities: [],
            updateEntities: [],
            localMessages: [],
            messages: [],
            jsons: [],
            tick: null
        }

        if (snapshotOlder.tick - 1 > this.lastProcessedTick) {
            for (var i = this.snapshots.length - 1; i > -1; i--) {
                var ss = this.snapshots[i]
                if (ss.tick < snapshotOlder.tick && !ss.processed) {
                    late.push(ss)
                    ss.processed = true
                    this.snapshots.splice(i, 1)
                }
            }
        }

        late.reverse()

        for (var j = 0; j < late.length; j++) {
            var ss = late[j]
            for (var i = 0; i < ss.createEntities.length; i++) {
                this.interpCache.saveEntity(ss.createEntities[i], ss.createEntities[i].protocol)
            }
            
            for (var i = 0; i < ss.updateEntities.length; i++) {
                this.interpCache.updateEntityPartial(
                    ss.updateEntities[i].id, 
                    ss.updateEntities[i].path, 
                    ss.updateEntities[i].value
                )
            }
            
            for (var i = 0; i < ss.deleteEntities.length; i++) {
                this.interpCache.deleteEntity(ss.deleteEntities[i])
            }            
        }        

        if (!snapshotOlder.processed) {
            iSnapshot.timestamp = snapshotOlder.timestamp
            iSnapshot.createEntities = iSnapshot.createEntities.concat(
                snapshotOlder.createEntities
            )
            iSnapshot.deleteEntities = iSnapshot.deleteEntities.concat(
                snapshotOlder.deleteEntities
            )
            iSnapshot.updateEntities = iSnapshot.updateEntities.concat(snapshotOlder.updateEntities)
            snapshotOlder.processed = true
            iSnapshot.tick = snapshotOlder.tick
            this.lastProcessedTick = snapshotOlder.tick

            for (var i = 0; i < iSnapshot.createEntities.length; i++) {
                this.interpCache.saveEntity(iSnapshot.createEntities[i], iSnapshot.createEntities[i].protocol)
            }
            
            for (var i = 0; i < iSnapshot.updateEntities.length; i++) {
                this.interpCache.updateEntityPartial(
                    iSnapshot.updateEntities[i].id, 
                    iSnapshot.updateEntities[i].path, 
                    iSnapshot.updateEntities[i].value
                )
            }
            
            for (var i = 0; i < iSnapshot.deleteEntities.length; i++) {
                this.interpCache.deleteEntity(iSnapshot.deleteEntities[i])
            }
        }
    }

    //console.log('late', late.length, (snapshotOlder == true))
    if (snapshotNewer && snapshotOlder) {
        if (snapshotOlder.tick >= this.lastProcessedTick) {
            var total = this.tickLength
            var portion = renderTime - snapshotOlder.timestamp
            var ratio = portion / total

            if (ratio > 1.0) {
                //console.log('ratio > 1')
                ratio = 1.0
            }

            iSnapshot.timestamp = lerp(
                snapshotOlder.timestamp,
                snapshotNewer.timestamp,
                ratio
            )

            for (var i = 0; i < snapshotOlder.updateEntities.length; i++) {
                var update = snapshotOlder.updateEntities[i]

                var entityOlder = snapshotOlder.entities.get(update.id)
                var prop = update.prop
                var propData = entityOlder.protocol.properties[prop]

                var binaryType = Binary[propData.type]

                if (propData.interp) {
                    var entityNewer = snapshotNewer.entities.get(update.id)

                    var valueOlder = getValue(entityOlder, propData.path)
                    var valueInterp = valueOlder
                    if (entityNewer) {
                        var valueNewer = getValue(entityNewer, propData.path)

                        if (typeof binaryType.interp === 'function') {
                            valueInterp = binaryType.interp(
                                valueOlder,
                                valueNewer,
                                ratio
                            )
                        } else {
                            valueInterp = lerp(valueOlder, valueNewer, ratio)
                        }
                    }

                    if (valueInterp !== getValue(this.interpCache.getEntity(update.id), propData.path)) {
                        iSnapshot.updateEntities.push({
                            id: update.id,
                            prop: prop,
                            path: propData.path,
                            value: valueInterp
                        })
                    }
                } else {
                    if (update.value !== getValue(this.interpCache.getEntity(update.id), update.path)) {
                        iSnapshot.updateEntities.push(update)
                    }
                }
            }
        }
    } else {
        // extrapolation could go here. disabled for now.
        //console.log('xtrap')
    }

    if (iSnapshot) {        
        for (var i = 0; i < iSnapshot.updateEntities.length; i++) {
            this.interpCache.updateEntityPartial(
                iSnapshot.updateEntities[i].id, 
                iSnapshot.updateEntities[i].path, 
                iSnapshot.updateEntities[i].value
            )
        }
        //console.log('pushing isnap')
        late.push(iSnapshot)
        
    }

    return {
        entities: late,
        interpA: snapshotOlder,
        interpB: snapshotNewer
    }
}


Client.prototype.getSnapshots = function() {
    return this.snapshots
}


Client.prototype.connect = function(address, handshake) {
    this.websocket = new WebSocket(address, 'nengi-protocol')
    this.websocket.binaryType = 'arraybuffer'

    if (typeof handshake === 'undefined' || !handshake) {
        handshake = {}
    }

    this.websocket.onopen = event => {
        this.websocket.send(createHandshakeBuffer(handshake).byteArray)
        //this.connectCallback = connectCallback
        //if (this.connectCallback) {
        //    this.connectCallback()
        //}
    }

    this.websocket.onerror = err => {
        //if (this.on)
        console.log('WebSocket error', err)
    }

    this.websocket.onclose = () => {
        if (this.closeCallback) {
            this.closeCallback()
        }
        //throw new Error('stopping game loop, connection to server closed')
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
                //console.log('pingKEY')
                var pongBuffer = createPongBuffer(snapshot.pingKey)
                //console.log(pongBuffer.byteArray)
                this.websocket.send(pongBuffer.byteArray)
            }
            if (snapshot.avgLatency !== -1) {
                //console.log('avg latency', snapshot.avgLatency)
                this.averagePing = snapshot.avgLatency
            }

            var worldState = new WorldState(
                this.serverTick,
                this.tickLength,
                snapshot,
                this.latest
            )
            
            this.avgDiffs.push(Date.now() - worldState.timestamp)

            var total = 0
            for (var i = 0; i < this.avgDiffs.length; i++) {
                total += this.avgDiffs[i]
            }
            this.avgDiff = total / this.avgDiffs.length
            while (this.avgDiffs.length > 20) {
                this.avgDiffs.shift()
            }

            this.latest = worldState
            this.unconfirmedCommands.forEach((command, key) => {
                if (key <= this.latest.clientTick) {
                    this.unconfirmedCommands.delete(key)
                }
            })

            this.snapshots.push(worldState)
            this.serverTick++

            if (this.snapshots[this.snapshots.length - 20]) {
                if (this.snapshots[this.snapshots.length - 20].processed) {
                    this.snapshots.splice(this.snapshots.length - 20, 1)
                }
            }
        } else if (typeof message.data === 'string') {
            //console.log('received string from server, ignoring', message.data)
            if (typeof this.onStringData === 'function') {
                this.onStringData(message.data)
            }
        } else {
            console.log('unknown websocket data type')
        }
    }
}

module.exports = Client