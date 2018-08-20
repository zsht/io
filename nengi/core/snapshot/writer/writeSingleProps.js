var Chunk = require('../Chunk').Chunk
var Binary = require('../../binary/Binary')
var BinaryType = require('../../binary/BinaryType')
var writePartial = require('../../protocol/write/writeSingle')

function writeSingleProps(chunkType, bitStream, singleProps) {
    if (singleProps.length > 0) {

        // ChunkType CreateEntities
        bitStream[Binary[BinaryType.UInt8].write](chunkType)

        // number of entities
        bitStream[Binary[BinaryType.UInt16].write](singleProps.length)


        for (var i = 0; i < singleProps.length; i++) {
            writePartial(bitStream, singleProps[i])
        }
        
        /*
        singleProps.forEach(singleProp => {
            writePartial(bitStream, singleProp)
        })
        */
    }
}

module.exports = writeSingleProps