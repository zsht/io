var nengi = require('../../')

describe('new nengi.EntityProtocol', function() {
	it('can create an entity schema', function() {

		var schema = new nengi.EntityProtocol({
			x: nengi.UInt8,
			y: nengi.UInt8,
			whatever: nengi.ASCIIString
		})

		expect(schema.keys[0]).toEqual('type')
		expect(schema.keys[1]).toEqual('id')
		expect(schema.keys[2]).toEqual('x')
		expect(schema.keys[3]).toEqual('y')
		expect(schema.keys[4]).toEqual('whatever')

		expect(schema.hasOptimizations).toBe(false)
	})

	it('can create an entity schema with batch', function() {
		var schema = new nengi.EntityProtocol({
			x: nengi.UInt16,
			y: nengi.UInt16,
			whatever: nengi.ASCIIString
		}, {
			x: { delta: true, type: nengi.Int8 },
			y: { delta: true, type: nengi.Int8 }
		})

		expect(schema.keys[0]).toEqual('type')
		expect(schema.keys[1]).toEqual('id')
		expect(schema.keys[2]).toEqual('x')
		expect(schema.keys[3]).toEqual('y')
		expect(schema.keys[4]).toEqual('whatever')


		// batch
		expect(schema.hasOptimizations).toBe(true)

		expect(schema.batch.keys[0]).toBe('x')
		expect(schema.batch.properties['x'].type).toBe(nengi.Int8)
		expect(schema.batch.properties['x'].delta).toBe(true)

		expect(schema.batch.keys[1]).toEqual('y')
		expect(schema.batch.properties['y'].type).toBe(nengi.Int8)
		expect(schema.batch.properties['y'].delta).toBe(true)
	})

	it('throws exception if missing x or y', function() {
		
		var createWithoutX = function() {
			var schema = new nengi.EntityProtocol({
				y: nengi.UInt16,
				whatever: nengi.ASCIIString
			})
		}
				
		var createWithoutY = function() {
			var schema = new nengi.EntityProtocol({
				x: nengi.UInt16,
				whatever: nengi.ASCIIString
			})
		}

		expect(createWithoutX).toThrow()
		expect(createWithoutY).toThrow()
	})


	it('throws exception if schemaConfig contains an array', function() {
		
		var createWithArray = function() {
			var schema = new nengi.EntityProtocol({
				x: nengi.UInt16,
				y: nengi.UInt16,
				whatever: { type: nengi.UInt8, indexType: nengi.UInt8 }
			})
		}
		expect(createWithArray).toThrow()
	})

	it('throws exception if schemaConfig contains another schema', function() {
		
		var createWithSubSchema = function() {
			var subSchema = new neng.Protocol({
				test: nengi.ASCIIString
			})
			var schema = new nengi.EntityProtocol({
				x: nengi.UInt16,
				y: nengi.UInt16,
				whatever: subSchema
			})
		}
		expect(createWithSubSchema).toThrow()
	})
})

