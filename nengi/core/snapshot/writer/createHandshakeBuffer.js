var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')
var Binary = require('../../binary/Binary')
var BinaryType = require('../../binary/BinaryType')
var Chunk = require('../Chunk').Chunk

function createHandshakeBuffer(handshake) {
	var json = JSON.stringify(handshake)

    var bits = 8
    bits += Binary[BinaryType.UTF8String].countBits(json)

    var bitBuffer = new BitBuffer(bits)
    var bitStream = new BitStream(bitBuffer)

    bitStream.writeUInt8(Chunk.Handshake)
    Binary[BinaryType.UTF8String].write(bitStream, json)

    return bitBuffer
}

module.exports = createHandshakeBuffer