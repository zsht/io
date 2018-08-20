var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var writeMessage = require('../../protocol/write/writeMessage')

function writeCommands(bitStream, commands) {

    // note: it is possible to write 0 commands
    // in which case the chunktype and 0 are still sent

    // ChunkType Commands
    bitStream[Binary[BinaryType.UInt8].write](Chunk.Commands)

    // number of Commands
    bitStream[Binary[BinaryType.UInt16].write](commands.length)

    for (var i = 0; i < commands.length; i++) {
        var command = commands[i]
        writeMessage(bitStream, command, command.protocol)
    }
    
}

module.exports = writeCommands