var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var writeMessage = require('../../protocol/write/writeMessage')

function writeLocalEvents(bitStream, localEvents) {
    if (localEvents.length > 0) {

        bitStream[Binary[BinaryType.UInt8].write](Chunk.LocalEvents)  
        bitStream[Binary[BinaryType.UInt16].write](localEvents.length)

        localEvents.forEach(localEvent => {
            writeMessage(bitStream, localEvent, localEvent.protocol)
        })
    }
}

module.exports = writeLocalEvents