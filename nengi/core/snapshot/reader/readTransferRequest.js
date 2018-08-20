var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function readTransferRequest(bitStream) {
	return {
		password: Binary[BinaryType.UTF8String].read(bitStream),
		data: JSON.parse(Binary[BinaryType.UTF8String].read(bitStream))
	}
}

module.exports = readTransferRequest