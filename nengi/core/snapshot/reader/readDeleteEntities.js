var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

//var config = require('../../../config')

function readDeleteEntities(bitStream,  config) {
    var ids = []
       
    var length = bitStream[Binary[BinaryType.UInt16].read]()
    for (var i = 0; i < length; i++) {
        var id = bitStream[Binary[config.ID_BINARY_TYPE].read]()
        ids.push(id)
    }

    return ids    
}

module.exports = readDeleteEntities