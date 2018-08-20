var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var writeBatch = require('../../protocol/write/writeBatch')

function writeBatches(bitStream, batches) {
    if (batches.length > 0) {

        bitStream[Binary[BinaryType.UInt8].write](Chunk.UpdateEntitiesOptimized)
        bitStream[Binary[BinaryType.UInt16].write](batches.length)

        batches.forEach(batch => {
            writeBatch(bitStream, batch)
        })
    }
}

module.exports = writeBatches