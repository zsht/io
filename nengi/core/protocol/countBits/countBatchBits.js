var Binary = require('../../binary/Binary')

module.exports = function(batch) {
    var bits = Binary[batch.idType].bits
    batch.updates.forEach(update => {
        bits += Binary[update.valueType].bits
    })
    return bits
}
