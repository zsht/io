var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function readTimesync(bitStream) {
    return {
        time: bitStream[Binary[BinaryType.Float64].read](),
        avgLatency: bitStream[Binary[BinaryType.UInt9].read](),
    }
}

module.exports = readTimesync