var Binary = require('../../binary/Binary')
var countPropBits = require('./countPropBits')

function countBits(single) {  
    var bits = Binary[single.idType].bits
    bits += Binary[single.keyType].bits
    //bits += Binary[single.valueType].bits
    bits += countPropBits(single.valueType, undefined, single.value)
    return bits
}

module.exports = countBits