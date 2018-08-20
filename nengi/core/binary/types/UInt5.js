/**
* Definition of an UInt5, an unsigned 5 bit integer
* range: 0 to 31
* uses BitBuffer functions for write/read
*/
var UInt5 = {
    'min': 0,
    'max': 31,
    'bits': 5,
    'compare': require('./compare/compareIntegers'),
    'write': 'writeUInt5',
    'read': 'readUInt5'
}

UInt5.boundsCheck = function(value) {
	return value >= UInt5.min && value <= UInt5.max
}

module.exports = UInt5