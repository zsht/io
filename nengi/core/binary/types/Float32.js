/**
* Definition of an Float32
* uses BitBuffer functions for write/read
*/
var Float32 = {
    'bits': 32,
    'compare': require('./compare/compareFloats'),
    'write': 'writeFloat32',
    'read': 'readFloat32'
}

Float32.boundsCheck = function(value) {
	return true //value >= Float32.min && value <= Float32.max
}

module.exports = Float32