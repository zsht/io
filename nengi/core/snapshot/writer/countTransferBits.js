var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function countTransferBits(key) {
    var bits = 0
    if (key !== -1) {
    	bits += Binary[BinaryType.UInt8].bits
        bits += Binary[BinaryType.UTF8String].countBits(key)
    }
    return bits
}

module.exports = countTransferBits