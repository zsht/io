var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function readTransfer(bitStream) {
	return {
		transferKey: Binary[BinaryType.UTF8String].read(bitStream),
		address: Binary[BinaryType.UTF8String].read(bitStream)
	}

}

module.exports = readTransfer