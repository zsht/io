var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var writeMessage = require('../../protocol/write/writeMessage')

function writeEngineMessages(bitStream, messages) {
    if (messages.length > 0) {

        // ChunkType CreateEntities
        bitStream[Binary[BinaryType.UInt8].write](Chunk.Engine)

        // number of messages
        bitStream[Binary[BinaryType.UInt16].write](messages.length)

        messages.forEach(message => {
            writeMessage(bitStream, message, message.protocol)
        })
    }
}

module.exports = writeEngineMessages