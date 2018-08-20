var proxify = require('../../core/protocol/proxify')
var deproxify = require('../../core/protocol/deproxify')
var copyProxy = require('../../core/protocol/copyProxy')
var nengi = require('../../')

/*
* Proxification is the conversion of any object described by a protocol
* into a serialized array. The data in the proxy is a copy of the original
* and can be reconstituted into an object using the schem as a guide. This
* is of course not the original object, but a copy - called a proxy. Why
* is a proxy an array and not an object? Most of its performance-critical usage
* involves iterating through its contents. It also parallels the data eventually
* written to buffer.
*/
describe('proxification', function() {
	it('of a simple object', function() {
		var obj = {
			number: 1234567890,
			string: 'Hello world'
		}

		var objProtocol = new nengi.Protocol({
			number: nengi.UInt32,
			string: nengi.ASCIIString
		})

		var proxy = proxify(obj, objProtocol)

		// NOTE: order of properties is alphabetical which works out
		// for this test, but access should use the protocol (see next test)
		expect(proxy.number).toEqual(obj.number)
		expect(proxy.string).toEqual(obj.string)

		var recreatedObj = deproxify(proxy, objProtocol)

		// equivalent but distinct
		expect(recreatedObj).toEqual(obj)
		expect(recreatedObj).not.toBe(obj)
	})

	it('of floats', function() {
		var obj = {
			a: Math.PI * 123,
			b: Math.PI * 321
		}

		var objProtocol = new nengi.Protocol({
			a: nengi.Float64,
			b: nengi.Float32
		})

		var proxy = proxify(obj, objProtocol)

		expect(proxy.a).toEqual(obj.a)
		expect(proxy.b).toEqual(obj.b)

		var recreatedObj = deproxify(proxy, objProtocol)

		// equivalent but distinct
		expect(recreatedObj).toEqual(obj)
		expect(recreatedObj).not.toBe(obj)
	})

	it('of path syntax', function() {
		var obj = {
			number: 1234567890,
			string: 'Hello world',
			physics: {
				velocity: {
					x: 55,
					y: -24
				}
			}
		}

		var objProtocol = new nengi.Protocol({
			number: nengi.UInt32,
			string: nengi.ASCIIString,
			'physics.velocity.x': nengi.Int8,
			'physics.velocity.y': nengi.Int8
		})

		var proxy = proxify(obj, objProtocol)
 
		expect(proxy.number).toEqual(obj.number)
		expect(proxy.string).toEqual(obj.string)

		var recreatedObj = deproxify(proxy, objProtocol)

		// equivalent but distinct
		expect(recreatedObj).toEqual(obj)
		expect(recreatedObj).not.toBe(obj)

		expect(recreatedObj.physics.velocity.y).toEqual(-24)
	})

	it('of an object containing an array of values', function() {
		var obj = {
			number: 1234567890,
			string: 'Hello world',
			array: [ 1, 2, 3, 4, 5 ]
		}

		var objProtocol = new nengi.Protocol({
			number: nengi.UInt32,
			string: nengi.ASCIIString,
			array: { type: nengi.UInt8, indexType: nengi.UInt8 }
		})

		var proxy = proxify(obj, objProtocol)

		expect(proxy.number).toEqual(obj.number)
		expect(proxy.string).toEqual(obj.string)

		var recreatedObj = deproxify(proxy, objProtocol)

		// equivalent but distinct
		expect(recreatedObj).toEqual(obj)
		expect(recreatedObj).not.toBe(obj)
		// explicitly checking that the array is a copy of the original
		expect(recreatedObj.array).not.toBe(obj.array)
		expect(recreatedObj.array).toEqual(obj.array)
	})

	it('of an object containing an array of strings', function() {
		var obj = {
			array: [ 'foo', 'bar', 'baz' ]
		}

		var objProtocol = new nengi.Protocol({
			array: { type: nengi.ASCIIString, indexType: nengi.UInt8 }
		})

		var proxy = proxify(obj, objProtocol)

		expect(proxy.array).toEqual(obj.array)

		var recreatedObj = deproxify(proxy, objProtocol)

		// equivalent but distinct
		expect(recreatedObj).toEqual(obj)
		expect(recreatedObj).not.toBe(obj)
		// explicitly checking that the array is a copy of the original
		expect(recreatedObj.array).not.toBe(obj.array)
		expect(recreatedObj.array).toEqual(obj.array)
	})


	/*
	it('of an object containing an array of objects without protocols', function() {

		// this was never an intended feature, and could never be read 
		// out of a binary buffer without additional data

		var obj = {
			number: 1234567890,
			string: 'Hello world',
			array: [ { x: 5 }, { x: 6 } ]
		}

		var objProtocol = new nengi.Protocol({
			number: nengi.UInt32,
			string: nengi.ASCIIString,
			array: { type: nengi.UInt8, indexType: nengi.UInt8 }
		})

		var proxy = proxify(obj, objProtocol)

		expect(proxy[objProtocol.properties.number.key]).toEqual(obj.number)
		expect(proxy[objProtocol.properties.string.key]).toEqual(obj.string)

		var recreatedObj = deproxify(proxy, objProtocol)

		console.log(recreatedObj, proxy)

		// equivalent but distinct
		expect(recreatedObj).toEqual(obj)
		expect(recreatedObj).not.toBe(obj)
		// explicitly checking that the array is a copy of the original
		expect(recreatedObj.array).not.toBe(obj.array)
		expect(recreatedObj.array).toEqual(obj.array)
	})
	*/

	it('of an object containing another object with their own protocol', function() {
		var obj = {
			number: 1234567890,
			string: 'Hello world',
			foo: { test: 123 }
		}

		var fooProtocol = new nengi.Protocol({
			test: nengi.UInt8
		})

		var objProtocol = new nengi.Protocol({
			number: nengi.UInt32,
			string: nengi.ASCIIString,
			foo: fooProtocol
		})

		var proxy = proxify(obj, objProtocol)

		expect(proxy.number).toEqual(obj.number)
		expect(proxy.string).toEqual(obj.string)

		var recreatedObj = deproxify(proxy, objProtocol)

		// equivalent but distinct
		expect(recreatedObj).toEqual(obj)
		expect(recreatedObj).not.toBe(obj)
		// explicitly checking that the sub object is distinct
		expect(recreatedObj.foo).not.toBe(obj.foo)
		expect(recreatedObj.foo).toEqual(obj.foo)
	})

	it('of an object containing an array of objects described by a protocol', function() {
		var obj = {
			number: 1234567890,
			string: 'Hello world',
			foo: [
				{ test: 123 },
				{ test: 456 },
				{ test: 789 }
			] 
		}

		var fooProtocol = new nengi.Protocol({
			test: nengi.UInt8
		})

		var objProtocol = new nengi.Protocol({
			number: nengi.UInt32,
			string: nengi.ASCIIString,
			foo: { type: fooProtocol, indexType: nengi.UInt8 }
		})

		var proxy = proxify(obj, objProtocol)

		expect(proxy.number).toEqual(obj.number)
		expect(proxy.string).toEqual(obj.string)

		var recreatedObj = deproxify(proxy, objProtocol)

		// equivalent but distinct
		expect(recreatedObj).toEqual(obj)
		expect(recreatedObj).not.toBe(obj)

		// explicitly checking that the sub objects are distinct
		expect(recreatedObj.foo).not.toBe(obj.foo)
		expect(recreatedObj.foo).toEqual(obj.foo)
		expect(recreatedObj.foo[0]).not.toBe(obj.foo[0])
		expect(recreatedObj.foo[0]).toEqual(obj.foo[0])

		expect(recreatedObj.foo[2].test).toEqual(789)
	})

	it('of arbitrarily complicated objects', function() {

		// NOTE: it is possible to create a cyclic relationship, and that will
		// cause an infinite loop.

		var obj = {}
		obj.number = 16
		obj.string = 'I am a container'
		obj.foo = {}
		obj.foo.array = []

		for (var i = 0; i < 5; i++) {
			var bar = {
				index: i,
				message: 'Hello I am ' + i
			}
			obj.foo.array.push(bar)
			obj.foo.test = i
		}

		var barProtocol = new nengi.Protocol({
			index: nengi.UInt8,
			message: nengi.ASCIIString
		})

		var fooProtocol = new nengi.Protocol({
			test: nengi.UInt8,
			array: { type: barProtocol, indexType: nengi.UInt8 }
		})

		var objProtocol = new nengi.Protocol({
			number: nengi.UInt32,
			string: nengi.ASCIIString,
			foo: fooProtocol
		})

		var proxy = proxify(obj, objProtocol)

		expect(proxy.number).toEqual(obj.number)
		expect(proxy.string).toEqual(obj.string)

		var recreatedObj = deproxify(proxy, objProtocol)

		// equivalent but distinct
		expect(recreatedObj).toEqual(obj)
		expect(recreatedObj).not.toBe(obj)
	})

	it('copy, advanced', function() {

		// testing copyProxy using the complicated example

		var obj = {}
		obj.number = 16
		obj.string = 'I am a container'
		obj.component = {
			x: 50,
			y: 50
		}
		obj.foo = {}
		obj.foo.array = []

		for (var i = 0; i < 5; i++) {
			var bar = {
				index: i,
				message: 'Hello I am ' + i
			}
			obj.foo.array.push(bar)
			obj.foo.test = i
		}

		var barProtocol = new nengi.Protocol({
			index: nengi.UInt8,
			message: nengi.ASCIIString
		})

		var fooProtocol = new nengi.Protocol({
			test: nengi.UInt8,
			array: { type: barProtocol, indexType: nengi.UInt8 }
		})

		var objProtocol = new nengi.Protocol({
			number: nengi.UInt32,
			string: nengi.ASCIIString,
			'component.x': nengi.UInt8,
			'component.y': nengi.UInt8,
			foo: fooProtocol
		})

		var proxy = proxify(obj, objProtocol)

		var copy = copyProxy(proxy, objProtocol)

		expect(copy).toEqual(proxy)
		expect(copy).not.toBe(proxy)
	})
})