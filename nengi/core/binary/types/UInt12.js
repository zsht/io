/**
* Definition of an UInt12, an unsigned 12 bit integer
* range: 0 to 2047
* uses BitBuffer functions for write/read
*/
var UInt12 = {
    'min': 0,
    'max': 4095,
    'bits': 12,
    'compare': require('./compare/compareIntegers'),
    'write': 'writeUInt12',
    'read': 'readUInt12'
}

UInt12.boundsCheck = function(value) {
	return value >= UInt12.min && value <= UInt12.max
}

module.exports = UInt12