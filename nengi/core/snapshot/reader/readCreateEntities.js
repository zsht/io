var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var readMessage = require('../../protocol/read/readMessage')
//var config = require('../../../config')

function readCreateEntities(bitStream, protocols, config) {
    // number of entities
    var length = bitStream[Binary[BinaryType.UInt16].read]()

    var entities = []
    for (var i = 0; i < length; i++) {
        var type = bitStream[Binary[config.TYPE_BINARY_TYPE].read]()
        var protocol = protocols.getProtocol(type)
        var entity = readMessage(
            bitStream, 
            protocol, 
            1, 
            type, 
            config.TYPE_PROPERTY_NAME
        )
        entity.protocol = protocol
        entities.push(entity)
    }
    return entities 
}

module.exports = readCreateEntities