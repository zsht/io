var Binary = require('../../binary/Binary')
//var config = require('../../../config')
var readProp = require('./readProp')

function readSingle(bitStream, entityCache, config) {
    var id = bitStream[Binary[config.ID_BINARY_TYPE].read]()
    var protocol = entityCache.getEntity(id).protocol
    var propKey = bitStream[Binary[protocol.keyType].read]()
    var prop = protocol.keys[propKey]
    var propData = protocol.properties[prop]
    var value = readProp(bitStream, propData.type, propData.arrayIndexType)//bitStream[Binary[propData.type].read]()

    return {
        id: id,
        prop: prop,
        path: propData.path,
        value: value
    }
}

module.exports = readSingle
