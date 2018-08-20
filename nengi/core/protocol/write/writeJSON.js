var utf8 = require('utf8')

var writeJSON = function(bitStream, json) {
    var encoded = utf8.encode(json)
    bitStream.writeUInt32(encoded.length)
    for (var i = 0; i < encoded.length; i++) {
        bitStream.writeUInt8(encoded.charCodeAt(i))
    }
}

module.exports = writeJSON