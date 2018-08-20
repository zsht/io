var Binary = require('../../binary/Binary')

function writeBatch(bitStream, batch) {
    bitStream[Binary[batch.idType].write](batch.id)
    batch.updates.forEach(update => {
        bitStream[Binary[update.valueType].write](update.value)
    })
}

module.exports = writeBatch