var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function writePing(bitStream, key) {
    if (key > -1) {
        bitStream[Binary[BinaryType.UInt8].write](Chunk.Ping)
        bitStream[Binary[BinaryType.UInt8].write](key)
    }
}

module.exports = writePing