var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function readPong(bitStream) {
   return bitStream[Binary[BinaryType.UInt8].read]()
}

module.exports = readPong