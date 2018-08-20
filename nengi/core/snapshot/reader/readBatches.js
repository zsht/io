var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var readBatch = require('../../protocol/read/readBatch')

function readBatches(bitStream, entityCache) {  
    var length = bitStream[Binary[BinaryType.UInt16].read]()

    var batches = []
    for (var i = 0; i < length; i++) {
        var batch = readBatch(bitStream, entityCache)
        batches.push(batch)
    }
    return batches
}

module.exports = readBatches