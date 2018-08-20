var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var writeMessage = require('../../protocol/write/writeMessage')

function writeCreateEntities(chunkType, bitStream, entities) {
    if (entities.length > 0) {

        bitStream[Binary[BinaryType.UInt8].write](chunkType)

        // number of entities
        bitStream[Binary[BinaryType.UInt16].write](entities.length)

        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i]
            writeMessage(bitStream, entity, entity.protocol)
        }
    }
}

module.exports = writeCreateEntities