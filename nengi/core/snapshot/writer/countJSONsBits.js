var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var countJSONBits = require('../../protocol/countBits/countJSONBits')

function countJSONsBits(jsons) {
    var bits = 0
    if (jsons.length > 0) {
        bits += Binary[BinaryType.UInt8].bits
        bits += Binary[BinaryType.UInt16].bits
        jsons.forEach(json => {
            bits += countJSONBits(json)
        })
    }
    return bits
}

module.exports = countJSONsBits