var Binary = require('../../binary/Binary')

var readDelete = function(bitStream, idType) {
    bitStream[Binary[idType].read]()
}

module.exports = readDelete