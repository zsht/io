var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var countBatchBits = require('../../protocol/countBits/countBatchBits')

function countBatchesBits(batches) {
    var bits = 0
    if (batches.length > 0) {
        bits += Binary[BinaryType.UInt8].bits
        bits += Binary[BinaryType.UInt16].bits
        batches.forEach(batch => {
            bits += countBatchBits(batch)
        })
    }
    return bits
}

module.exports = countBatchesBits