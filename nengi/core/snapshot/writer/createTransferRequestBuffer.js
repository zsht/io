var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')
var Binary = require('../../binary/Binary')
var BinaryType = require('../../binary/BinaryType')
var Chunk = require('../Chunk').Chunk

function createTransferRequestBuffer(password, miscData) {
	var json = JSON.stringify(miscData)

    var bits = 8
    bits += Binary[BinaryType.UTF8String].countBits(password)
	bits += Binary[BinaryType.UTF8String].countBits(json)

    var bitBuffer = new BitBuffer(bits)
    var bitStream = new BitStream(bitBuffer)

    bitStream.writeUInt8(Chunk.TransferRequest)
    Binary[BinaryType.UTF8String].write(bitStream, password)
    Binary[BinaryType.UTF8String].write(bitStream, json)

    return bitBuffer
}

module.exports = createTransferRequestBuffer