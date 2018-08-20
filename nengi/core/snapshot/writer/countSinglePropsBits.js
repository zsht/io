var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var countPartialBits = require('../../protocol/countBits/countSingleBits')

function countSinglePropsBits(singleProps) {
	var bits = 0
    if (singleProps.length > 0) {
        bits += Binary[BinaryType.UInt8].bits
        bits += Binary[BinaryType.UInt16].bits
        for (var i = 0; i < singleProps.length; i++) {
            var singleProp = singleProps[i]
            bits += countPartialBits(singleProp)
        }
    }
    return bits
}

module.exports = countSinglePropsBits