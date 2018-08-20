var Binary = require('../../binary/Binary')
var BinaryType = require('../../binary/BinaryType')
var BitBuffer = require('../../binary/BitBuffer')
var BitStream = require('../../binary/BitStream')
var Chunk = require('../Chunk').Chunk
var ChunkReverse = require('../Chunk').ChunkReverse

var readCommands = require('./readCommands')
var readPong = require('./readPong')
var readTransferRequest = require('./readTransferRequest')
var readTransferResponse = require('./readTransferResponse')

function readCommandBuffer(arrayBuffer, protocols, config) {
    //console.log(arrayBuffer)
    var bitBuffer = new BitBuffer(arrayBuffer)
    var bitStream = new BitStream(bitBuffer)

    var ret = {
        transferResponse: -1,
        transferRequest: -1,
        handshake: -1,
        tick: -1,
        pong: -1,
        commands: []
    }

    while (bitStream.offset + 16 <= bitBuffer.bitLength) {
        //console.log('while', bitStream.offset, bitBuffer.bitLength)
        var msgType = bitStream.readUInt8()
        //console.log('readcommandbuffer', msgType, ChunkReverse[msgType])

        switch (msgType) {
            case Chunk.TransferResponse:
                ret.transferResponse = readTransferResponse(bitStream)
                break
            case Chunk.TransferRequest:
                ret.transferRequest = readTransferRequest(bitStream)
                break
            case Chunk.Handshake:
                //console.log('HERE')
                ret.handshake = JSON.parse(Binary[BinaryType.UTF8String].read(bitStream))
                //console.log('handshake', ret.handshake)
               // if (!ret.handshake) {
                //    throw new Error('Invalid handshake')
                //}
                break
            case Chunk.ClientTick:
                ret.tick = bitStream.readUInt32()
                break
            case Chunk.Pong:
                ret.pong = bitStream.readUInt8()
                break
            case Chunk.Commands:
                ret.commands = readCommands(bitStream, protocols, config)
                break
            default:
                //console.log('unknown data from client')
                break
        }
    }

    return ret
}

module.exports = readCommandBuffer