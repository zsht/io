var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var readSingle = require('../../protocol/read/readSingle')
//var config = require('../../../config')

function readSingleProps(bitStream, entityCache, config) {

    // number of singleProps
    var length = bitStream[Binary[BinaryType.UInt16].read]()

    var singleProps = []
    for (var i = 0; i < length; i++) {

        var singleProp = readSingle(bitStream, entityCache, config)
        singleProps.push(singleProp)
    }
    return singleProps    
}

module.exports = readSingleProps 