/**
* Definition of an Int6, a signed 6 bit integer
* range: -32 to 31
* uses BitBuffer functions for write/read
*/
var Int6 = {
    'min': -32,
    'max': 31, 
    'bits': 6,
    'compare': require('./compare/compareIntegers'),
    'write': 'writeInt6',
    'read': 'readInt6'
}

Int6.boundsCheck = function(value) {
	return value >= Int6.min && value <= Int6.max
}

module.exports = Int6