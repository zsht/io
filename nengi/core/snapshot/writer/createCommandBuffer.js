var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')
var Chunk = require('../Chunk').Chunk

var countCommandsBits = require('./countCommandsBits')
var writeCommands = require('./writeCommands')

function createCommandBuffer(tick, commands) {
    var bits = 0
    bits += 8
    bits += 32
    bits += countCommandsBits(commands)

    var bitBuffer = new BitBuffer(bits)
    var bitStream = new BitStream(bitBuffer)

    bitStream.writeUInt8(Chunk.ClientTick)
    bitStream.writeUInt32(tick)
    writeCommands(bitStream, commands)

    return bitBuffer
}

module.exports = createCommandBuffer