/**
* Definition of an Int10, a signed 10 bit integer
* range: -512 to 511
* uses BitBuffer functions for write/read
*/
var Int10 = {
    'min': -512,
    'max': 511,
    'bits': 10,
    'compare': require('./compare/compareIntegers'),
    'write': 'writeInt10',
    'read': 'readInt10'
}

Int10.boundsCheck = function(value) {
	return value >= Int10.min && value <= Int10.max
}

module.exports = Int10