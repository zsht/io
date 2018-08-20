var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function countPongBits(key) {
    var bits = 0
    if (key > -1) {
        bits += Binary[BinaryType.UInt8].bits
        bits += Binary[BinaryType.UInt8].bits
    }
    return bits
}

module.exports = countPongBits