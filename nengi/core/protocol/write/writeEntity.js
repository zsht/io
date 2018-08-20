var writeMessage = require('./message')

var writeEntity = function(bitStream, proxy, schema) {
	writeMessage(bitStream, proxy, schema)
}

module.exports = writeEntity