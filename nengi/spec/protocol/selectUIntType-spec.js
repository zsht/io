var selectUIntType = require('../../core/protocol/selectUIntType')
var BinaryType = require('../../core/binary/BinaryType')

describe('selectUIntType', function() {

    it('selects UInt2 to represent 3', function() {
        var type = selectUIntType(3)
        expect(type).toBe(BinaryType.UInt2)
    })

    it('selects UInt3 to represent 7', function() {
        var type = selectUIntType(7)
        expect(type).toBe(BinaryType.UInt3)
    })

     it('selects UInt4 to represent 15', function() {
        var type = selectUIntType(15)
        expect(type).toBe(BinaryType.UInt4)
    })

     it('selects UInt5 to represent 31', function() {
        var type = selectUIntType(31)
        expect(type).toBe(BinaryType.UInt5)
    })

    it('selects UInt6 to represent 63', function() {
        var type = selectUIntType(63)
        expect(type).toBe(BinaryType.UInt6)
    })

    it('selects UInt7 to represent 127', function() {
        var type = selectUIntType(127)
        expect(type).toBe(BinaryType.UInt7)
    })

    it('selects UInt8 to represent 255', function() {
        var type = selectUIntType(255)
        expect(type).toBe(BinaryType.UInt8)
    })

    it('selects UInt9 to represent 511', function() {
        var type = selectUIntType(511)
        expect(type).toBe(BinaryType.UInt9)
    })

    it('selects UInt10 to represent 1023', function() {
        var type = selectUIntType(1023)
        expect(type).toBe(BinaryType.UInt10)
    })

    it('selects UInt11 to represent 2047', function() {
        var type = selectUIntType(2047)
        expect(type).toBe(BinaryType.UInt11)
    })

    it('selects UInt12 to represent 4095', function() {
        var type = selectUIntType(4095)
        expect(type).toBe(BinaryType.UInt12)
    })

    it('selects UInt16 to represent 65535', function() {
        var type = selectUIntType(65535)
        expect(type).toBe(BinaryType.UInt16)
    })

    it('selects UInt32 for 65535 through 4294967295', function() {
        var type = selectUIntType(65536)
        expect(type).toBe(BinaryType.UInt32)

        var type = selectUIntType(4294967295)
        expect(type).toBe(BinaryType.UInt32)
    })

    it('throws an exception for anything higher than 4294967295', function() {

        var outOfBounds = function() {
            var type = selectUIntType(4294967295 + 1)
        }
        
        expect(outOfBounds).toThrow()
    })
})