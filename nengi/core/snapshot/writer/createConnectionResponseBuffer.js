var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')
var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function createConnectionReponseBuffer(acceptConnection, text) {
    var bits = 8
    bits += 2
    bits += Binary[BinaryType.UTF8String].countBits(text)

    var bitBuffer = new BitBuffer(bits)
    var bitStream = new BitStream(bitBuffer)

    bitStream[Binary[BinaryType.UInt8].write](Chunk.ConnectionResponse)
    bitStream.writeBoolean(acceptConnection)
    Binary[BinaryType.UTF8String].write(bitStream, text)

    return bitBuffer
}

module.exports = createConnectionReponseBuffer
