var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var writeJSON = require('../../protocol/write/writeJSON')

function writeJSONs(bitStream, jsons) {
    if (jsons.length > 0) {

        bitStream[Binary[BinaryType.UInt8].write](Chunk.JSONs)

        // number of messages
        bitStream[Binary[BinaryType.UInt16].write](jsons.length)

        jsons.forEach(json => {
            writeJSON(bitStream, json)
        })
    }
}

module.exports = writeJSONs