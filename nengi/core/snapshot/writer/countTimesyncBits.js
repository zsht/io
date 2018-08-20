var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function countTimesyncBits(time) {
    var bits = 0
    if (time > -1) {
        bits += Binary[BinaryType.UInt8].bits
        bits += Binary[BinaryType.Float64].bits
        bits += Binary[BinaryType.UInt9].bits
    }
    //console.log('countTimesyncBits', bits)
    return bits
}

module.exports = countTimesyncBits