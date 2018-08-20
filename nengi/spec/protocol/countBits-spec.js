var nengi = require('../../')
var Binary = require('../../core/binary/Binary')
var countMessageBits = require('../../core/protocol/countBits/countMessageBits')
var proxify = require('../../core/protocol/proxify')
var config = require('../../config')

describe('countBits', function() {
	it('can can count bits of an entity', function() {

		// NOTE: new nengi.EntityProtocol adds an id and type property to the protocol
		var protocol = new nengi.EntityProtocol({
			x: nengi.UInt8,
			y: nengi.UInt8,
			whatever: nengi.ASCIIString
		})

		var obj = {
			x: 50,
			y: 50,
			whatever: 'test'
		}

		var proxy = proxify(obj, protocol)

		var bits = countMessageBits(proxy, protocol)

		var expectedBits = 
			Binary[config.ID_BINARY_TYPE].bits // id
			+ Binary[config.TYPE_BINARY_TYPE].bits // type
			+ Binary[nengi.UInt8].bits // x
			+ Binary[nengi.UInt8].bits // y
			+ Binary[nengi.UInt8].bits // ASCIIString length
			+ (Binary[nengi.UInt8].bits * obj.whatever.length) // ASCIIString contents

		expect(expectedBits).toBe(bits)
	})

	it('can count bits in complicated objects', function() {
		
		var subProtocol = new nengi.Protocol({
			baz: nengi.UInt8,
			test: nengi.ASCIIString,
			float: nengi.Float64
		})

		var protocol = new nengi.MessageProtocol({
			yo: nengi.Boolean,
			foo: nengi.UInt16,
			bar: nengi.UInt32,
			whatever: { type: subProtocol, indexType: nengi.UInt8 }
		})

		// described by protocol
		var message = {
			yo: true,
			foo: 12345,
			bar: 1234567890,
			whatever: [
				// described by subProtocol
				{ baz: 1, test: 'a', float: Math.PI * 1 },
				{ baz: 2, test: 'ab', float: Math.PI * 2 },
				{ baz: 3, test: 'abc', float: Math.PI * 3 }
			]
		}

		var proxy = proxify(message, protocol)
		var bits = countMessageBits(proxy, protocol)

		// manual addition of message's binary types
		var expectedBits = 
			+ Binary[nengi.Boolean].bits // message.yo
			+ Binary[nengi.UInt16].bits // message.foo
			+ Binary[nengi.UInt32].bits // message.bar
			+ Binary[nengi.UInt16].bits // message.whatever array length
			// baz1
			+ Binary[nengi.UInt8].bits // message.whatever[0].baz
			+ Binary[nengi.UInt8].bits // message.whatever[0].test string length
			+ (Binary[nengi.UInt8].bits * message.whatever[0].test.length) // message.whatever[0].test string contents
			+ Binary[nengi.Float64].bits
			// baz2
			+ Binary[nengi.UInt8].bits // message.whatever[1].baz
			+ Binary[nengi.UInt8].bits // message.whatever[1].test string length
			+ (Binary[nengi.UInt8].bits * message.whatever[1].test.length) // message.whatever[1].test string contents
			+ Binary[nengi.Float64].bits
			// baz3
			+ Binary[nengi.UInt8].bits // message.whatever[2].baz
			+ Binary[nengi.UInt8].bits // message.whatever[2].test string length
			+ (Binary[nengi.UInt8].bits * message.whatever[2].test.length) // message.whatever[2].test string contents
			+ Binary[nengi.Float64].bits
			
		expect(expectedBits).toBe(bits)
	})
})

