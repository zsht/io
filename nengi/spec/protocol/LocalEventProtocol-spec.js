var nengi = require('../../')


describe('LocalEventProtocol', function() {
	it('can create a positional message protocol', function() {

		// using the shorthang
		var protocol = new nengi.LEvent({
			x: nengi.UInt8,
			y: nengi.UInt8,
			whatever: nengi.ASCIIString
		})

		expect(protocol.keys[0]).toEqual('type')
		expect(protocol.keys[1]).toEqual('x')
		expect(protocol.keys[2]).toEqual('y')
		expect(protocol.keys[3]).toEqual('whatever')
	})

	it('throws exception if missing x or y', function() {
		
		var createWithoutX = function() {
			var protocol = new nengi.LEvent({
				y: nengi.UInt16,
				whatever: nengi.ASCIIString
			})
		}
				
		var createWithoutY = function() {
			var protocol = new nengi.LEvent({
				x: nengi.UInt16,
				whatever: nengi.ASCIIString
			})
		}

		expect(createWithoutX).toThrow()
		expect(createWithoutY).toThrow()
	})


	it('supports arrays', function() {
		
		var protocol = new nengi.LEvent({
			x: nengi.UInt16,
			y: nengi.UInt16,
			whatever: { type: nengi.UInt8, indexType: nengi.UInt8 }
		})

		expect(protocol.properties.whatever.isArray).toBe(true)
	})

	it('supports subProtocols', function() {
		
		var subProtocol = new nengi.Protocol({
			test: nengi.ASCIIString
		})
		var protocol = new nengi.LEvent({
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
		var protocol = new nengi.LEvent({
			x: nengi.UInt16,
			y: nengi.UInt16,
			whatever: { type: subProtocol, indexType: nengi.UInt8 }
		})
		
		expect(protocol.properties.whatever.isArray).toBe(true)
		expect(protocol.properties.whatever.protocol).toBe(subProtocol)
	})
})

