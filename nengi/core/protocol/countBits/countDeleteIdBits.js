var Binary = require('../../binary/Binary')

module.exports = function(type) {
    return Binary[type].bits
}
