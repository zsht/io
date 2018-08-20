/**
* Definition of an Float64
* uses BitBuffer functions for write/read
*/
var Float64 = {
    'bits': 64,
    'compare': require('./compare/compareFloats'),
    'write': 'writeFloat64',
    'read': 'readFloat64'
}

Float64.boundsCheck = function(value) {
    return true //value >= Float32.min && value <= Float32.max
}

module.exports = Float64