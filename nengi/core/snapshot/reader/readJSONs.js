var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')
var readJSON = require('../../protocol/read/readJSON')

function readJSONs(bitStream) {
    var length = bitStream[Binary[BinaryType.UInt16].read]()
    var jsons = []
    for (var i = 0; i < length; i++) {
        var json = readJSON(bitStream)
        jsons.push(json)        
    }
    return jsons
}

module.exports = readJSONs