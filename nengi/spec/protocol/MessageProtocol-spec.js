var nengi = require('../../')
var BitBuffer = require('../../core/binary/BitBuffer')
var BitStream = require('../../core/binary/BitStream')
var write = require('../../core/protocol/write/writeMessage')
var read = require('../../core/protocol/read/readMessage')

describe('new nengi.MessageProtocol', function() {
	it('can create a message protocol', function() {

		var protocol = new nengi.MessageProtocol({
			whatever: nengi.ASCIIString
		})

		expect(protocol.keys[0]).toEqual('type')
		expect(protocol.keys[1]).toEqual('whatever')
	})

	it('does not throw exception if missing x or y', function() {
		
		var createWithoutX = function() {
			var protocol = new nengi.MessageProtocol({
				y: nengi.UInt16,
				whatever: nengi.ASCIIString
			})
		}
				
		var createWithoutY = function() {
			var protocol = new nengi.MessageProtocol({
				x: nengi.UInt16,
				whatever: nengi.ASCIIString
			})
		}

		expect(createWithoutX).not.toThrow()
		expect(createWithoutY).not.toThrow()
	})


	it('supports arrays', function() {
		
		var protocol = new nengi.MessageProtocol({
			x: nengi.UInt16,
			y: nengi.UInt16,
			whatever: { type: nengi.UInt8, indexType: nengi.UInt8 }
		})

		expect(protocol.properties.whatever.isArray).toBe(true)

		var originalObject = {
			x: 12345,
			y: 54321,
			whatever: [ 0, 123, 255]
		}

		var bitBuffer = new BitBuffer(256)
		var writeStream = new BitStream(bitBuffer) 
		var readStream = new BitStream(bitBuffer)
		
		originalObject.type = 0
		write(writeStream, originalObject, protocol)
		var type = readStream.readUInt8()
		var networkObject = read(readStream, protocol, 1, type, 'type')
		
		expect(networkObject).toEqual(originalObject)
	})

	it('supports subProtocols', function() {
		
		var subProtocol = new nengi.Protocol({
			test: nengi.ASCIIString
		})
		var protocol = new nengi.MessageProtocol({
			x: nengi.UInt16,
			y: nengi.UInt16,
			whatever: subProtocol
		})
		
		expect(protocol.properties.whatever.protocol).toBe(subProtocol)
	})

	it('supports arrays of subProtocols', function() {
		
		var subProtocol = new nengi.Protocol({
			test: nengi.ASCIIString
		})
		var protocol = new nengi.MessageProtocol({
			x: nengi.UInt16,
			y: nengi.UInt16,
			whatever: { type: subProtocol, indexType: nengi.UInt8 }
		})
		
		expect(protocol.properties.whatever.isArray).toBe(true)
		expect(protocol.properties.whatever.protocol).toBe(subProtocol)
	})
})

