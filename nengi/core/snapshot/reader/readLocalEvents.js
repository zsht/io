var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var readMessage = require('../../protocol/read/readMessage')
//var config = require('../../../config')

function readLocalEvents(bitStream, protocols, config) {
    // number of events
    var length = bitStream[Binary[BinaryType.UInt8].read]()

    var events = []
    for (var i = 0; i < length; i++) {
        var type = bitStream[Binary[config.TYPE_BINARY_TYPE].read]()
        var protocol = protocols.getProtocol(type)
        var event = readMessage(
            bitStream, 
            protocol, 
            1, 
            type, 
            config.TYPE_PROPERTY_NAME
        )
        event.protocol = protocol
        events.push(event)
    }
    return events    
}

module.exports = readLocalEvents