var Binary = require('../../binary/Binary')
var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')

var readBatches = require('./readBatches')
var readSingleProps = require('./readSingleProps')
var readCreateEntities = require('./readCreateEntities')
var readDeleteEntities = require('./readDeleteEntities')

var readLocalEvents = require('./readLocalEvents')
var readMessages = require('./readMessages' )
var readJSONs = require('./readJSONs')

var readTimesync = require('./readTimesync')

var readPing = require('./readPing')

var readTransfer = require('./readTransfer')

var readConnectionResponse = require('./readConnectionResponse')

var readEngineMessages = require('./readEngineMessages')

//var config = require('../../../config')

var Chunk = require('../Chunk').Chunk
var ChunkReverse = require('../Chunk').ChunkReverse
/*
function simplifySnapshot(rawSnapshot, entityCache) {
    var snapshot = {
        tick: 0,
        timestamp: Date.now(),
        localEvents: [],
        messages: [],
        jsons: [],
        createEntities: [],
        deleteEntities: [],
        updateEntities: []
    }

    snapshot.localEvents = rawSnapshot.localEvents
    snapshot.messages = rawSnapshot.messages
    snapshot.jsons = rawSnapshot.jsons
    snapshot.createEntities = rawSnapshot.createEntities
    snapshot.deleteEntities = rawSnapshot.deleteEntities

    // flatten all of the varying types of updates to one syntax:
    // { id: <entityId>, prop: <propToUpdate>, value: <newPropValue> }
    rawSnapshot.updateEntities.partial.forEach(singleProp => {
        snapshot.updateEntities.push(singleProp)
    })

    rawSnapshot.updateEntities.optimized.forEach(batch => {
        var entity = entityCache.getEntity(batch.id)
        batch.updates.forEach(update => {
            snapshot.updateEntities.push({
                id: batch.id,
                prop: update.prop,
                value: entity[update.prop]
            })
        })
    })
    return snapshot
}
*/




function readSnapshotBuffer(arrayBuffer, protocols, entityCache, config, connectCallback, transferCallback) {
    var bitBuffer = new BitBuffer(arrayBuffer)
    var bitStream = new BitStream(bitBuffer)

    //console.log(bitStream)

    var snapshot = {
        tick: 0,
        clientTick: -1,

        timestamp: -1,
        pingKey: -1,
        avgLatency: -1,


        engineMessages: [],


        // a copy of all visible events
        localMessages: [],

        // a copy of all messages
        messages: [],

        jsons: [],

        // a copy of all visible entities
        createEntities: [],

        // ids of entites no longer relevant to client
        deleteEntities: [],

        // updates to individual entities, using varying optimizations
        updateEntities: {
            // not used
            full: [],
            // per-property updates
            partial: [],
            // microOptimizations
            optimized: []
        },

        createComponents: [],
        deleteComponents: [],

        updateComponents: {
            // not used
            full: [],
            // per-property updates
            partial: [],
            // microOptimizations
            optimized: []
        }

    }

    //var timestamp = bitStream.readFloat64()
    //console.log(Date.now() - timestamp)
    //snapshot.timestamp = timestamp
    //snapshot.clientTick = bitStream.readUInt32()

    //console.log('+==================================+')
    while (bitStream.offset + 16 <= bitBuffer.bitLength) {
        //console.log('while', bitStream.offset, bitBuffer.bitLength)
        var msgType = bitStream.readUInt8()
        //console.log(msgType, ChunkReverse[msgType])

        switch (msgType) {
            case Chunk.Engine: 
                var engineMessages = readEngineMessages(bitStream, protocols, config)
                snapshot.engineMessages = engineMessages
                break
            case Chunk.ClientTick:
                snapshot.clientTick = bitStream.readUInt32()
                break
            case Chunk.Ping:
                var pingKey = readPing(bitStream)
                snapshot.pingKey = pingKey
                break
            case Chunk.Timesync:
                var times = readTimesync(bitStream)
                //console.log('READ Timesync', times)
                snapshot.timestamp = times.time
                snapshot.avgLatency = times.avgLatency
                break


            case Chunk.CreateEntities:
                var entities = readMessages(bitStream, protocols, config)
                //console.log('READ ENTITIES', entities)
                snapshot.createEntities = entities
                break
            case Chunk.UpdateEntitiesPartial:
                var singleProps = readSingleProps(bitStream, entityCache, config)
                //console.log('SINGLE PROPS', singleProps)
                snapshot.updateEntities.partial = singleProps
                break
            case Chunk.UpdateEntitiesOptimized:
                var batches = readBatches(bitStream, entityCache)
                //console.log('BATCHES', batches)
                snapshot.updateEntities.optimized = batches
                break
            case Chunk.DeleteEntities:
                var deleteEntities = readDeleteEntities(bitStream, config)
                //console.log('DeleteEntities', deleteEntities)
                snapshot.deleteEntities = deleteEntities
                break

            case Chunk.CreateComponents:
                var entities = readMessages(bitStream, protocols, config)
                //console.log('READ ENTITIES', entities)
                snapshot.createComponents = entities
                break
            case Chunk.UpdateComponentsPartial:
                var singleProps = readSingleProps(bitStream, entityCache, config)
                //console.log('SINGLE PROPS', singleProps)
                snapshot.updateComponents.partial = singleProps
                break
            case Chunk.DeleteComponents:
                var deleteEntities = readDeleteEntities(bitStream, config)
                //console.log('DeleteEntities', deleteEntities)
                snapshot.deleteComponents = deleteEntities
                break


            case Chunk.LocalEvents:
                //console.log('prot', protocols)
                var localEvents = readMessages(bitStream, protocols, config)
                snapshot.localMessages = localEvents
                break
            case Chunk.Messages:
                var messages = readMessages(bitStream, protocols, config)
                snapshot.messages = messages
                break
            case Chunk.JSONs:
                var jsons = readJSONs(bitStream)
                snapshot.jsons = jsons
                break
            case Chunk.TransferClient: 
                var transfer = readTransfer(bitStream)
                //console.log('TRANSFER', transfer)
                transferCallback(transfer.transferKey, transfer.address)
                break
            case Chunk.ConnectionResponse: 
                var response = readConnectionResponse(bitStream)
                connectCallback(response)
                return // exit this code! not a normal snapshot
            default:
                break
        }
    }
    //console.log('ss',snapshot)
    entityCache.saveSnapshot(snapshot)
    
    return snapshot //simplifySnapshot(snapshot, entityCache)
    

}

module.exports = readSnapshotBuffer