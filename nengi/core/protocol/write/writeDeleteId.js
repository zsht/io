var Binary = require('../../binary/Binary')

var writeDeleteId = function(bitStream, idType, id) {
    bitStream[Binary[idType].write](id)
}

module.exports = writeDeleteId