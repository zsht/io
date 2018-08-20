/**
* Definition of an UInt4, an unsigned 4 bit integer
* range: 0 to 15
* uses BitBuffer functions for write/read
*/
var UInt4 = {
    'min': 0,
    'max': 15,
    'bits': 4,
    'compare': require('./compare/compareIntegers'),
    'write': 'writeUInt4',
    'read': 'readUInt4'
}

UInt4.boundsCheck = function(value) {
	return value >= UInt4.min && value <= UInt4.max
}

module.exports = UInt4