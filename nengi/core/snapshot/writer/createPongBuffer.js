var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')
var Chunk = require('../Chunk').Chunk

var countPongBits = require('./countPongBits')
var writePong = require('./writePong')

function createPongBuffer(pongKey) {
    var bits = 0
    bits += 8
    bits += 8

    var bitBuffer = new BitBuffer(bits)
    var bitStream = new BitStream(bitBuffer)

    bitStream.writeUInt8(Chunk.Pong)
    bitStream.writeUInt8(pongKey)


    return bitBuffer
}

module.exports = createPongBuffer