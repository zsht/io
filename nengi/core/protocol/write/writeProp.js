var Binary = require('../../binary/Binary')
var BinaryType = require('../../binary/BinaryType')

var writeProp = function(bitStream, type, arrayIndexType, value) {
    var binaryMeta = Binary[type]
    
    if (binaryMeta.customWrite) {
        binaryMeta.write(bitStream, value)
    } else {
        bitStream[binaryMeta.write](value)
    }    
}

module.exports = writeProp