var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function readConnectionResponse(bitStream) {
	return {
		accepted: bitStream.readBoolean(),
		text: Binary[BinaryType.UTF8String].read(bitStream)
	}

}

module.exports = readConnectionResponse