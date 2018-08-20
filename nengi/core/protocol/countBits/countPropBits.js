var Binary = require('../../binary/Binary')
var BinaryType = require('../../binary/BinaryType')

module.exports = function(type, arrayIndexType, value) {
    //console.log('type', type, 'arrayIndexType', arrayIndexType, 'value', value)
    var bits = 0
    var binaryMeta = Binary[type]

    if (binaryMeta.countBits) {
        bits = binaryMeta.countBits(value)
    } else {
        bits = binaryMeta.bits
    }  
    
    return bits
}
