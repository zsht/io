var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')
var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function createTransferClientBuffer(transferKey, address) {
    var bits = 8
    bits += Binary[BinaryType.UTF8String].countBits(transferKey)
    bits += Binary[BinaryType.UTF8String].countBits(address)

    var bitBuffer = new BitBuffer(bits)
    var bitStream = new BitStream(bitBuffer)

    bitStream[Binary[BinaryType.UInt8].write](Chunk.TransferClient)
    Binary[BinaryType.UTF8String].write(bitStream, transferKey)
    Binary[BinaryType.UTF8String].write(bitStream, address)
    return bitBuffer
}

module.exports = createTransferClientBuffer
