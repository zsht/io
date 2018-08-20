var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var readMessage = require('../../protocol/read/readMessage')
//var config = require('../../../config')

function readCommands(bitStream, protocols, config) {
    // number of commands
    var length = bitStream[Binary[BinaryType.UInt16].read]()
    var commands = []
    for (var i = 0; i < length; i++) {
        var type = bitStream[Binary[config.TYPE_BINARY_TYPE].read]()
        var protocol = protocols.getProtocol(type)
        var command = readMessage(
            bitStream, 
            protocol, 
            1, 
            type, 
            config.TYPE_PROPERTY_NAME
        )
        command.protocol = protocol
        commands.push(command)
    }
    return commands    
}

module.exports = readCommands