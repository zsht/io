var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function readPing(bitStream) {
   return bitStream[Binary[BinaryType.UInt8].read]()
}

module.exports = readPing