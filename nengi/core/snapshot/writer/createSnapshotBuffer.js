var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')

var countMessagesBits = require('./countMessagesBits')
var writeMessages = require('./writeMessages')
var writeCreateEntities = require('./writeCreateEntities')
var writeLocalEvents = require('./writeLocalEvents')

var countBatchesBits = require('./countBatchesBits')
var writeBatches = require('./writeBatches')

var countSinglePropsBits = require('./countSinglePropsBits')
var writeSingleProps = require('./writeSingleProps')

var countDeleteEntitiesBits = require('./countDeleteEntitiesBits')
var writeDeleteEntities = require('./writeDeleteEntities')

var countJSONsBits = require('./countJSONsBits')
var writeJSONs = require('./writeJSONs')

var countTimesyncBits = require('./countTimesyncBits')
var writeTimesync = require('./writeTimesync')

var countPingBits = require('./countPingBits')
var writePing = require('./writePing')

var writeEngineMessages = require('./writeEngineMessages')

var Chunk = require('../Chunk').Chunk

//var countTransferBits = require('./countTransferBits')
//var writeTransfer = require('./writeTransfer')


function createSnapshotBuffer(snapshot, config) {
    var bits = 0
    bits += 40

    bits += countMessagesBits(snapshot.engineMessages)
    bits += countPingBits(snapshot.pingKey)
    bits += countTimesyncBits(snapshot.timestamp)

    bits += countMessagesBits(snapshot.createEntities)
    bits += countSinglePropsBits(snapshot.updateEntities.partial)
    //bits += countBatchesBits(snapshot.updateEntities.optimized)
    bits += countDeleteEntitiesBits(snapshot.deleteEntities, config)

    //bits += countMessagesBits(snapshot.createComponents)
    //bits += countSinglePropsBits(snapshot.updateComponents.partial)
    //bits += countDeleteEntitiesBits(snapshot.deleteComponents, config)
   
    bits += countMessagesBits(snapshot.localEvents)
    bits += countMessagesBits(snapshot.messages)
    bits += countJSONsBits(snapshot.jsons)

    //console.log('partials', snapshot.updateEntities.partial)
    var bitBuffer = new BitBuffer(bits)
    var bitStream = new BitStream(bitBuffer)

    bitStream.writeUInt8(Chunk.ClientTick)
    bitStream.writeUInt32(snapshot.clientTick)

    writeEngineMessages(bitStream, snapshot.engineMessages)
    writePing(bitStream, snapshot.pingKey)
    writeTimesync(bitStream, snapshot.timestamp, snapshot.avgLatency)

    writeCreateEntities(Chunk.CreateEntities, bitStream, snapshot.createEntities)
    writeSingleProps(Chunk.UpdateEntitiesPartial, bitStream, snapshot.updateEntities.partial)
    //writeBatches(bitStream, snapshot.updateEntities.optimized)
    writeDeleteEntities(Chunk.DeleteEntities, bitStream, snapshot.deleteEntities, config)

    //writeCreateEntities(Chunk.CreateComponents, bitStream, snapshot.createComponents)
    //writeSingleProps(Chunk.UpdateComponentsPartial, bitStream, snapshot.updateComponents.partial)
    //writeDeleteEntities(Chunk.DeleteComponents, bitStream, snapshot.deleteComponents, config)
    
    writeLocalEvents(bitStream, snapshot.localEvents)
    writeMessages(bitStream, snapshot.messages)
    writeJSONs(bitStream, snapshot.jsons)

    //console.log('wrote', bits)

    return bitBuffer
}

module.exports = createSnapshotBuffer
