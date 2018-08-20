var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function readTransferResponse(bitStream) {
	return {
		password: Binary[BinaryType.UTF8String].read(bitStream),
		approved: bitStream.readBoolean(),
		transferKey: Binary[BinaryType.UTF8String].read(bitStream)
	}
}

module.exports = readTransferResponse