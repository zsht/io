var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var countMessageBits = require('../../protocol/countBits/countMessageBits')

function countCreateEntitiesBits(entities) {
    var bits = 0
    if (entities.length > 0) {
        bits += Binary[BinaryType.UInt8].bits
        bits += Binary[BinaryType.UInt16].bits
        entities.forEach(entity => {
            bits += countMessageBits(entity, entity.protocol)
        })
    }
    return bits
}

module.exports = countCreateEntitiesBits