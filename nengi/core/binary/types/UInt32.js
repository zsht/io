/**
* Definition of an UInt32, an unsigned 32 bit integer
* range: 0 to 4294967295
* uses BitBuffer functions for write/read
*/
var UInt32 = {
    'min': 0,
    'max': 4294967295,
    'bits': 32,
    'compare': require('./compare/compareIntegers'),
    'write': 'writeUInt32',
    'read': 'readUInt32'
}

UInt32.boundsCheck = function(value) {
	return value >= UInt32.min && value <= UInt32.max
}

module.exports = UInt32