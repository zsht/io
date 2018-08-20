var getValue = require('./getValue')
var setValue = require('./setValue')

var deproxify = function(proxy, protocol) {

    var obj = {}

    for (var i = 0; i < protocol.keys.length; i++) {
        
        var prop = protocol.properties[protocol.keys[i]]
        var value = getValue(proxy, prop.path)
        //var value = proxy[protocol.keys[i]]

        if (typeof value === 'undefined') {
            continue
        }
        
        // value is an array of nengi objects
        if (prop.isArray && prop.protocol) {
            var temp = []
            for (var j = 0; j < value.length; j++) {
                temp.push(deproxify(value[j], prop.protocol))
            }
            value = temp
        }

        // value is a nengi object
        if (!prop.isArray && prop.protocol) {
            value = deproxify(value, prop.protocol)
        }

        setValue(obj, prop.path, value)

    }

    return obj
}

module.exports = deproxify