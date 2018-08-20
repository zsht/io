/**
* Definition of an UInt10, an unsigned 10 bit integer
* range: 0 to 1023
* uses BitBuffer functions for write/read
*/
var UInt10 = {
    'min': 0,
    'max': 1023,
    'bits': 10,
    'compare': require('./compare/compareIntegers'),
    'write': 'writeUInt10',
    'read': 'readUInt10'
}

UInt10.boundsCheck = function(value) {
	return value >= UInt10.min && value <= UInt10.max
}

module.exports = UInt10