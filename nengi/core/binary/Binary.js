var BinaryType = require('./BinaryType')

var Binary = {}

/* unsigned! 0 to n */
// 0 to 1, false or true
Binary[BinaryType.Boolean] = require('./types/Boolean')
// 0 to 3
Binary[BinaryType.UInt2] = require('./types/UInt2')
// 0 to 7
Binary[BinaryType.UInt3] = require('./types/UInt3')
// 0 to 15
Binary[BinaryType.UInt4] = require('./types/UInt4')
// 0 to 31
Binary[BinaryType.UInt5] = require('./types/UInt5')
// 0 to 63
Binary[BinaryType.UInt6] = require('./types/UInt6')
// 0 to 127
Binary[BinaryType.UInt7] = require('./types/UInt7')
// 0 to 255
Binary[BinaryType.UInt8] = require('./types/UInt8')
// 0 to 511
Binary[BinaryType.UInt9] = require('./types/UInt9')
// 0 to 1023
Binary[BinaryType.UInt10] = require('./types/UInt10')
// 0 to 2047
Binary[BinaryType.UInt11] = require('./types/UInt11')
// 0 to 4095
Binary[BinaryType.UInt12] = require('./types/UInt12')
// 0 to 65535
Binary[BinaryType.UInt16] = require('./types/UInt16')
// 0 to 4294967295
Binary[BinaryType.UInt32] = require('./types/UInt32')

/* signed! includes negative numbers */
// -8 to 7
Binary[BinaryType.Int4] = require('./types/Int4')
// -32 to 31
Binary[BinaryType.Int6] = require('./types/Int6')
// -128 to 127
Binary[BinaryType.Int8] = require('./types/Int8')
// -512 to 511
Binary[BinaryType.Int10] = require('./types/Int10')
// -32768 to 32767
Binary[BinaryType.Int16] = require('./types/Int16')
// -2147483648 to 2147483647
Binary[BinaryType.Int32] = require('./types/Int32')

Binary[BinaryType.Float32] = require('./types/Float32')

Binary[BinaryType.Float64] = require('./types/Float64')

/* special fancy types! */
Binary[BinaryType.EntityId] = require('./types/EntityId')
// rotation in radians networked in one byte
Binary[BinaryType.Rotation8] = require('./types/Rotation8')
Binary[BinaryType.RotationFloat32] = require('./types/RotationFloat32')
// an RGB color, with one byte for each component
Binary[BinaryType.RGB888] = require('./types/RGB888')
// String support, ASCIIStrings up to 255 characters
Binary[BinaryType.ASCIIString] = require('./types/ASCIIString')
// utf8 strings, potentially huge
Binary[BinaryType.UTF8String] = require('./types/UTF8String')

Binary.countBits = function(propConfig, value) {
    var binaryMeta = Binary[propConfig.type]
    if (propConfig.isArray) {
        var totalBits = 0
        var arrayIndexBinaryMeta = Binary[propConfig.arrayIndexBinaryType]
        totalBits += arrayIndexBinaryMeta.bits
        if (binaryMeta.customBits) {
            totalBits += binaryMeta.countBits(value) * value.length
        } else {
            totalBits += binaryMeta.bits * value.length
        }
        return totalBits
    } else {
       if (binaryMeta.customBits) {
            return binaryMeta.countBits(value)
        } else {
            return binaryMeta.bits
        } 
    }
}

module.exports = Binary