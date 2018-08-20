/**
* Definition of an Int32, a signed 32 bit integer
* range: -2147483648 to 2147483647
* uses BitBuffer functions for write/read
*/
var Int32 = {
    'min': -2147483648,
    'max': 2147483647,
    'bits': 32,
    'compare': require('./compare/compareIntegers'),
    'write': 'writeInt32',
    'read': 'readInt32'
}

Int32.boundsCheck = function(value) {
	return value >= Int32.min && value <= Int32.max
}

module.exports = Int32