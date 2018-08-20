var BitBuffer = require('../../core/binary/BitBuffer')

describe('BitBuffer constructor', function() {

	it('can be created with a length', function() {
		var bb = new BitBuffer(10)
		expect(bb).toBeDefined()
		expect(bb.bitLength).toEqual(10)
	})

	it('can be created from a buffer', function() {
		var bb = new BitBuffer(new Buffer([1, 2, 3, 253, 254, 255]))
		expect(bb).toBeDefined()

		// counting up by 8 bits as an offset and verifying the data
		expect(bb.readUInt8(0)).toBe(1)
		expect(bb.readUInt8(8)).toBe(2)
		expect(bb.readUInt8(16)).toBe(3)
		expect(bb.readUInt8(24)).toBe(253)
		expect(bb.readUInt8(32)).toBe(254)
		expect(bb.readUInt8(40)).toBe(255)
	})
})


describe('BitBuffer write/read', function() {

	var bb = new BitBuffer(64)

	it('true/false as Boolean', function() {
		bb.writeBoolean(true, 0)
		expect(bb.readBoolean(0)).toBe(true)
		bb.writeBoolean(false, 0)
		expect(bb.readBoolean(0)).toBe(false)
	})

	it('3 as UInt2', function() {
		bb.writeUInt2(3, 0)
		expect(bb.readUInt2(0)).toBe(3)
	})

	it('-2 as Int2', function() {
		bb.writeInt2(-2, 0)
		expect(bb.readInt2(0)).toBe(-2)
	})

	it('7 as UInt3', function() {
		bb.writeUInt3(7, 0)
		expect(bb.readUInt3(0)).toBe(7)
	})

	it('-4 as Int3', function() {
		bb.writeInt3(-4, 0)
		expect(bb.readInt3(0)).toBe(-4)
	})

	it('15 as UInt4', function() {
		bb.writeUInt4(15, 0)
		expect(bb.readUInt4(0)).toBe(15)
	})

	it('-8 as Int4', function() {
		bb.writeInt4(-8, 0)
		expect(bb.readInt4(0)).toBe(-8)
	})

	it('31 as UInt5', function() {
		bb.writeUInt5(31, 0)
		expect(bb.readUInt5(0)).toBe(31)
	})

	it('-16 as Int5', function() {
		bb.writeInt5(-16, 0)
		expect(bb.readInt5(0)).toBe(-16)
	})

	it('63 as UInt6', function() {
		bb.writeUInt6(63, 0)
		expect(bb.readUInt6(0)).toBe(63)
	})

	it('-32 as Int6', function() {
		bb.writeInt6(-32, 0)
		expect(bb.readInt6(0)).toBe(-32)
	})

	it('127 as UInt7', function() {
		bb.writeUInt7(127, 0)
		expect(bb.readUInt7(0)).toBe(127)
	})

	it('-64 as Int7', function() {
		bb.writeInt7(-64, 0)
		expect(bb.readInt7(0)).toBe(-64)
	})

	it('255 as UInt8', function() {
		bb.writeUInt8(255, 0)
		expect(bb.readUInt8(0)).toBe(255)
	})

	it('-128 as Int8', function() {
		bb.writeInt8(-128, 0)
		expect(bb.readInt8(0)).toBe(-128)
	})

	it('511 as UInt9', function() {
		bb.writeUInt9(511, 0)
		expect(bb.readUInt9(0)).toBe(511)
	})

	it('-256 as Int9', function() {
		bb.writeInt9(-256, 0)
		expect(bb.readInt9(0)).toBe(-256)
	})

	it('1023 as UInt10', function() {
		bb.writeUInt10(1023, 0)
		expect(bb.readUInt10(0)).toBe(1023)
	})

	it('-512 as Int10', function() {
		bb.writeInt10(-512, 0)
		expect(bb.readInt10(0)).toBe(-512)
	})

	it('2047 as UInt11', function() {
		bb.writeUInt11(2047, 0)
		expect(bb.readUInt11(0)).toBe(2047)
	})

	it('-1024 as Int11', function() {
		bb.writeInt11(-1024, 0)
		expect(bb.readInt11(0)).toBe(-1024)
	})

	it('4095 as UInt12', function() {
		bb.writeUInt12(4095, 0)
		expect(bb.readUInt12(0)).toBe(4095)
	})

	it('-2048 as Int12', function() {
		bb.writeInt12(-2048, 0)
		expect(bb.readInt12(0)).toBe(-2048)
	})

	it('65535 as UInt16', function() {
		bb.writeUInt16(65535, 0)
		expect(bb.readUInt16(0)).toBe(65535)
	})

	it('-32768 as Int16', function() {
		bb.writeInt16(-32768, 0)
		expect(bb.readInt16(0)).toBe(-32768)
	})

	it('4294967295 as UInt32', function() {
		bb.writeUInt32(4294967295, 0)
		expect(bb.readUInt32(0)).toBe(4294967295)
	})

	it('-2147483648 as Int32', function() {
		bb.writeInt32(-2147483648, 0)
		expect(bb.readInt32(0)).toBe(-2147483648)
	})

	it('Math.PI as Float32 accurate to: 3.141592 (6 digits past decimal)', function() {
		bb.writeFloat32(Math.PI, 0)
		expect(bb.readFloat32(0)).toBeCloseTo(Math.PI, 6)
	})

	it('Math.PI as Float64 accurate to: ' + Math.PI, function() {
		bb.writeFloat64(Math.PI, 0)
		expect(bb.readFloat64(0)).toEqual(Math.PI)
	})

	it('fails to write -129 as an Int8 (min would be -128), result is 127', function() {
		bb.writeInt8(-129, 0)
		expect(bb.readInt8(0)).not.toBe(-129)
	})

	it('does not throw an exception for exceeding the range of write', function() {
		var test = function() {
			bb.writeInt8(-129, 0)			
		}
		expect(test).not.toThrow()		
	})
})

describe('BitBuffer write/read, non-byte-aligned values', function() {

	var bb = new BitBuffer(64)

	it('true as Boolean', function() {
		bb.writeBoolean(true, 0)
		expect(bb.readBoolean(0)).toBe(true)
	})

	it('false as Boolean', function() {
		bb.writeBoolean(false, 0)
		expect(bb.readBoolean(0)).toBe(false)
	})

	it('-4 as Int3', function() {
		bb.writeInt3(-4, 0)
		expect(bb.readInt3(0)).toBe(-4)
	})

	it('7 as UInt3', function() {
		bb.writeUInt3(7, 0)
		expect(bb.readUInt3(0)).toBe(7)
	})

	it('-7 as Int4', function() {
		bb.writeInt4(-7, 0)
		expect(bb.readInt4(0)).toBe(-7)
	})

	it('15 as UInt4', function() {
		bb.writeUInt4(15, 0)
		expect(bb.readUInt4(0)).toBe(15)
	})

	it('-32 as Int6', function() {
		bb.writeInt6(-32, 0)
		expect(bb.readInt6(0)).toBe(-32)
	})

	it('63 as UInt6', function() {
		bb.writeUInt6(63, 0)
		expect(bb.readUInt6(0)).toBe(63)
	})

	it('-512 as Int10', function() {
		bb.writeInt10(-512, 0)
		expect(bb.readInt10(0)).toBe(-512)
	})

	it('1023 as UInt10', function() {
		bb.writeUInt10(1023, 0)
		expect(bb.readUInt10(0)).toBe(1023)
	})

	it('-2048 as Int12', function() {
		bb.writeInt12(-2048, 0)
		expect(bb.readInt12(0)).toBe(-2048)
	})

	it('4095 as UInt12', function() {
		bb.writeUInt12(4095, 0)
		expect(bb.readUInt12(0)).toBe(4095)
	})

	it('can represent increments less than one byte, through bitLength', function() {
		var bb2 = new BitBuffer(1)
		bb2.writeBoolean(true, 0)
		expect(bb2.readBoolean(0)).toBe(true)
		
		// the buffer is one full byte
		expect(bb2.byteLength).toBe(1)
		// but bitLength is one bit
		expect(bb2.bitLength).toBe(1)
	})

	it('9 bits will have a bufferLength of 2 and a bitLength of 9', function() {
		var bb2 = new BitBuffer(9)
		bb2.writeBoolean(true, 0)
		bb2.writeBoolean(true, 1)
		bb2.writeBoolean(true, 2)
		bb2.writeBoolean(true, 3)
		bb2.writeBoolean(true, 4)
		bb2.writeBoolean(true, 5)
		bb2.writeBoolean(true, 6)
		bb2.writeBoolean(true, 7)
		bb2.writeBoolean(false, 8)
		bb2.writeBoolean(true, 9)

		// sanity check that some of the data is correct
		expect(bb2.readBoolean(8)).toBe(false)
		expect(bb2.readBoolean(9)).toBe(true)
		
		// the buffer is two bytes (the minimum needed to hold 9 bits)
		expect(bb2.byteLength).toBe(2)
		// of which 9 bits have been written to
		expect(bb2.bitLength).toBe(9)
	})
})


describe('BitBuffer write/read, different offsets, arbitrary samples', function() {

	var bb = new BitBuffer(10000)

	it('Boolean at offset 112', function() {
		bb.writeBoolean(true, 112)
		expect(bb.readBoolean(112)).toBe(true)
	})

	it('Int10 at offset 889', function() {
		bb.writeInt10(-512, 889)
		expect(bb.readInt10(889)).toBe(-512)
	})

	it('UInt12 at offset 33', function() {
		bb.writeUInt12(4095, 33)
		expect(bb.readUInt12(33)).toBe(4095)
	})

	it('Math.PI as Float64 at offset 5002', function() {
		bb.writeFloat64(Math.PI, 5002)
		expect(bb.readFloat64(5002)).toEqual(Math.PI)
	})


	it('a 25 number series of 8-bit unsigned integers, starting at offset 60', function() {
		var offset = 60
		for (var i = 0; i < 25; i++) {
			bb.writeUInt8(200+i, offset)
			expect(bb.readUInt8(offset)).toBe(200+i)
			offset += 8 // increment by 8 bits
		}
		// expect the last number in the series to be 224
		expect(bb.readUInt8(offset-8)).toBe(224)
	})
})
