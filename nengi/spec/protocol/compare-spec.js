var nengi = require('../../')
var compare = require('../../core/protocol/compare')
var proxify = require('../../core/protocol/proxify')

describe('compare', () => {

	it('one change', () => {
		var orc = {
			x: 50,
			y: 55,
			hitpoints: 100,
			likesKittens: true
		}

		var orcProtocol = new nengi.EntityProtocol({
			x: nengi.Int16,
			y: nengi.Int16,
			hitpoints: nengi.UInt8,
			likesKittens: nengi.Boolean
		})

		var proxyOrc0 = proxify(orc, orcProtocol)
		orc.x += 5
		var proxyOrc1 = proxify(orc, orcProtocol)

		var diffs = compare(proxyOrc0, proxyOrc1, orcProtocol)
 
		expect(diffs.length).toBe(1)
		expect(diffs[0].prop).toBe('x')
		expect(diffs[0].was).toBe(50)
		expect(diffs[0].is).toBe(55)
	})

	it('string change', () => {
		var orc = {
			x: 50,
			y: 55,
			name: 'Jimmy',
		}

		var orcProtocol = new nengi.EntityProtocol({
			x: nengi.Int16,
			y: nengi.Int16,
			name: nengi.ASCIIString
		})

		var proxyOrc0 = proxify(orc, orcProtocol)
		orc.name = 'Sarah'
		var proxyOrc1 = proxify(orc, orcProtocol)

		var diffs = compare(proxyOrc0, proxyOrc1, orcProtocol)
 
		expect(diffs.length).toBe(1)
		expect(diffs[0].prop).toBe('name')
		expect(diffs[0].was).toBe('Jimmy')
		expect(diffs[0].is).toBe('Sarah')
	})

	it('multiple changes', () => {
		var orc = {
			x: 50,
			y: 55,
			hitpoints: 100,
			likesKittens: true
		}

		var orcProtocol = new nengi.EntityProtocol({
			x: nengi.Int16,
			y: nengi.Int16,
			hitpoints: nengi.UInt8,
			likesKittens: nengi.Boolean
		})

		var proxyOrc0 = proxify(orc, orcProtocol)

		orc.x += 5
		orc.y = 1240
		orc.hitpoints = 99
		orc.likesKittens = false

		var proxyOrc1 = proxify(orc, orcProtocol)

		var diffs = compare(proxyOrc0, proxyOrc1, orcProtocol)	

		expect(diffs.length).toBe(4)
		expect(diffs[3].prop).toBe('likesKittens')
		expect(diffs[3].was).toBe(true)
		expect(diffs[3].is).toBe(false)
	})

	it('float changes', () => {
		var orc = {
			x: 50,
			y: 55,
			hitpoints: 100,
			mana: 100
		}

		var orcProtocol = new nengi.EntityProtocol({
			x: nengi.Int16,
			y: nengi.Int16,
			hitpoints: nengi.Float32,
			mana: nengi.Float64
		})

		var proxyOrc0 = proxify(orc, orcProtocol)

		orc.x += 5
		orc.y = 1240
		orc.hitpoints += Math.PI * 11
		orc.mana += Math.PI * 12

		var proxyOrc1 = proxify(orc, orcProtocol)

		var diffs = compare(proxyOrc0, proxyOrc1, orcProtocol)	

		expect(diffs.length).toEqual(4)

		expect(diffs[0].prop).toEqual('x')
		expect(diffs[1].prop).toEqual('y')
		expect(diffs[2].prop).toEqual('hitpoints')
		expect(diffs[3].prop).toEqual('mana')

		expect(diffs[2].was).toEqual(100)
		expect(diffs[2].is).toEqual(100 + Math.PI * 11)

		expect(diffs[3].was).toEqual(100)
		expect(diffs[3].is).toEqual(100 + Math.PI * 12)
	})

	it('ignores changes too small to change an integer', () => {
		var obj = {
			asInt: Math.PI,
			asFloat32: Math.PI,
			asFloat64: Math.PI,
		}

		var protocol = new nengi.EntityProtocol({
			asInt: nengi.UInt32,
			asFloat32: nengi.Float32,
			asFloat64: nengi.Float64
		})

		var proxyA = proxify(obj, protocol)

		obj.asInt += 0.0001 // when convetered to an int this will not be a change
		obj.asFloat32 += 0.0001
		obj.asFloat64 += 0.0001

		var proxyB = proxify(obj, protocol)

		var diffs = compare(proxyA, proxyB, protocol)	

		expect(diffs.length).toEqual(2)
	})


	it('path syntax', () => {
		var orc = {
			position: {
				x: 50,
				y: 55
			},
			hitpoints: 100,
			likesKittens: true
		}

		var orcProtocol = new nengi.EntityProtocol({
			'position.x': nengi.Int16,
			'position.y': nengi.Int16,
			hitpoints: nengi.UInt8,
			likesKittens: nengi.Boolean
		})

		var proxyOrc0 = proxify(orc, orcProtocol)
		orc.position.x += 5
		var proxyOrc1 = proxify(orc, orcProtocol)

		var diffs = compare(proxyOrc0, proxyOrc1, orcProtocol)
 
		expect(diffs.length).toBe(1)
		expect(diffs[0].prop).toBe('position.x')
		expect(diffs[0].path).toEqual(['position', 'x'])
		expect(diffs[0].was).toBe(50)
		expect(diffs[0].is).toBe(55)
	})

	xit('rotation', () => {
		var orc = {
			rotation: 0.1
		}

		var orcProtocol = new nengi.EntityProtocol({
			rotation: nengi.Rotation8
		})

		var proxyOrc0 = proxify(orc, orcProtocol)
		orc.rotation += 0.1
		var proxyOrc1 = proxify(orc, orcProtocol)
		var diffs = compare(proxyOrc0, proxyOrc1, orcProtocol)
 
		// Rotation8 is converted from radians to 0-255 automatically in real use
		// this test simulates that convesion by calling byteToRadians manually
		var scale = function(n, a, b, c, d) {
		  return (d - c) * (n - a) / (b - a) + c
		}

		var radiansToByte = function(radians) {
		  return Math.floor(scale(radians, 0, 2 * Math.PI, 0, 255) % 256)
		}

		var byteToRadians = function(uint8) {
		  return uint8 * ((2 * Math.PI) / 255)
		}

		expect(diffs.length).toBe(1)
		expect(diffs[0].prop).toBe('rotation')
		expect(byteToRadians(diffs[0].was)).toBeCloseTo(0.1)
		expect(byteToRadians(diffs[0].is)).toBeCloseTo(0.2)


	})

})