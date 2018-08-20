/**
* Definition of an UInt9, an usigned 9 bit integer
* range: 0 to 511
* uses BitBuffer functions for write/read
*/
var UInt9 = {
    'min': 0,
    'max': 511,
    'bits': 9,
    'compare': require('./compare/compareIntegers'),
    'write': 'writeUInt9',
    'read': 'readUInt9'
}

UInt9.boundsCheck = function(value) {
	return value >= UInt9.min && value <= UInt9.max
}

module.exports = UInt9