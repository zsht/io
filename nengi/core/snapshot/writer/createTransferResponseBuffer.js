var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')
var Binary = require('../../binary/Binary')
var BinaryType = require('../../binary/BinaryType')
var Chunk = require('../Chunk').Chunk

function createTransferResponseBuffer(password, approved, transferKey) {
    var bits = 8
    bits += Binary[BinaryType.UTF8String].countBits(password)
    bits += 2
    bits += Binary[BinaryType.UTF8String].countBits(transferKey)

    var bitBuffer = new BitBuffer(bits)
    var bitStream = new BitStream(bitBuffer)

    bitStream.writeUInt8(Chunk.TransferResponse)
    Binary[BinaryType.UTF8String].write(bitStream, password)
    bitStream.writeBoolean(approved)
    Binary[BinaryType.UTF8String].write(bitStream, transferKey)

    return bitBuffer
}

module.exports = createTransferResponseBuffer