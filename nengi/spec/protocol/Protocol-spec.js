var nengi = require('../../')


var Binary = require('../../core/binary/Binary')
var BinaryType = require('../../core/binary/BinaryType')
var BitBuffer = require('../../core/binary/BitBuffer')
var BitStream = require('../../core/binary/BitStream')
var proxify = require('../../core/protocol/proxify')
var deproxify = require('../../core/protocol/deproxify')


var read = require('../../core/protocol/read/readMessage')
var write = require('../../core/protocol/write/writeMessage')


describe('Protocol syntax', function() {	

	it('simple, defaults', function() {

		/* Example objects that could be networked with this protocol 
		function Hero() {
			this.x = 5
			this.y = 5
		}

		var obj = { x: 5, y: 5 }
		*/

		var protocolConfig = {
			'x': nengi.UInt8,
			'y': nengi.UInt8
		}

		var protocol = new nengi.Protocol(protocolConfig)

		expect(protocol.keys[0]).toEqual('x')
		expect(protocol.properties['x'].key).toEqual(0)
		expect(protocol.properties['x'].protocol).toEqual(null)
		expect(protocol.properties['x'].type).toEqual(nengi.UInt8)
		expect(protocol.properties['x'].interp).toEqual(false)
		expect(protocol.properties['x'].isArray).toEqual(false)
		expect(protocol.properties['x'].arrayIndexType).toEqual(null)
		expect(protocol.properties['x'].path).toEqual(['x'])

		expect(protocol.keys[1]).toEqual('y')
		expect(protocol.properties['y'].key).toEqual(1)
		// etc
	})

	it('verbose, defaults', function() {

		/* Example objects that could be networked with this protocol 
		function Point() {
			this.x = 5
			this.y = 5
		}

		var obj = { x: 5, y: 5 }
		*/

		// verbose syntax, same result as above
		var protocolConfig = {
			'x': { type: nengi.UInt8, interp: false },
			'y': { type: nengi.UInt8, interp: false }
		}

		var protocol = new nengi.Protocol(protocolConfig)	

		expect(protocol.keys[0]).toEqual('x')
		expect(protocol.properties['x'].key).toEqual(0)
		expect(protocol.properties['x'].protocol).toEqual(null)
		expect(protocol.properties['x'].type).toEqual(nengi.UInt8)
		expect(protocol.properties['x'].interp).toEqual(false)
		expect(protocol.properties['x'].isArray).toEqual(false)
		expect(protocol.properties['x'].arrayIndexType).toEqual(null)
		expect(protocol.properties['x'].path).toEqual(['x'])

		expect(protocol.keys[1]).toEqual('y')
		expect(protocol.properties['y'].key).toEqual(1)
	})


	it('verbose, customized interp', function() {

		/* Example objects that could be networked with this protocol 
		function Orc() {
			this.hitpoints = 100
		}

		var obj = { hitpoints: 100 }
		*/

		var protocolConfig = {
			'hitpoints': { type: nengi.UInt8, interp: true }
		}

		var protocol = new nengi.Protocol(protocolConfig)

		expect(protocol.properties['hitpoints'].interp).toEqual(true)
	})

	it('array', function() {

		/* Example objects that could be networked with this protocol 
		function Map() {
			this.tiles = [0, 15, 2, 3, 4, 11, 13] // up to array length 255
		}

		var obj = { tiles: [0, 15, 2, 3, 4, 11, 13] // up to array length 255 }
		*/

		var protocolConfig = {
			// 'test' contains an array of Int8 values, whose index is a UInt8
			'tiles': { type: nengi.UInt4, indexType: nengi.UInt8 }
		}

		var protocol = new nengi.Protocol(protocolConfig)

		expect(protocol.properties['tiles'].type).toEqual(nengi.UInt4)
		expect(protocol.properties['tiles'].isArray).toEqual(true)
		expect(protocol.properties['tiles'].arrayIndexType).toEqual(nengi.UInt8)
	})

	it('protocol containing a protocol', function() {


		/* Example object that could be networked with this protocol
		
		var resourceSurvey = {
			nearestBerryBush: { x: -213, y: 44, berryCount: 88 },
			nearestOreVein: { x: 2303, y: 3092, oreQuantity: 6 }
		}
		// NOTE: I would just make this as one protocol with all of the data, but
		// for this test it will be broken into 3 protocols.
		*/

		var berryBushProtocolConfig = {
			'x': nengi.Int16,
			'y': nengi.Int16,
			'berryCount': nengi.UInt8
		}

		var berryBushProtocol = new nengi.Protocol(berryBushProtocolConfig)

		var oreVeinProtocolConfig = {
			'x': nengi.Int16,
			'y': nengi.Int16,
			'oreQuantity': nengi.UInt4
		}

		var oreVeinProtocol = new nengi.Protocol(oreVeinProtocolConfig)

		var resourceSurveyProtocolConfig = {
			'nearestBerryBush': berryBushProtocol,
			'nearestOreVein': oreVeinProtocol
		}

		var protocol = new nengi.Protocol(resourceSurveyProtocolConfig)

		expect(protocol.properties['nearestBerryBush'].protocol).toEqual(berryBushProtocol)
		expect(protocol.properties['nearestBerryBush'].protocol.properties['berryCount'].type).toEqual(nengi.UInt8)

		expect(protocol.properties['nearestOreVein'].protocol).toEqual(oreVeinProtocol)
		expect(protocol.properties['nearestOreVein'].protocol.properties['oreQuantity'].type).toEqual(nengi.UInt4)
	})

	it('protocol contains an array of objects that have a protocol', function() {

		/* Example objects that could be networked with this protocol

		function Tile(humidity, temperature, elevation) {
			this.humdity = humidity
			this.temperature = temperature
			this.elevation = elevation
		}

		function HeightMap() {
			this.tiles = [
				new Tile(15, 25, 2),
				new Tile(22, 27, 3),
				new Tile(23, 28, 2)
			] // array length is limited by 'indexType'
		}

		// or

		var obj = { 
			tiles: [
				{ humidity: 15, temperature: 25, elevation: 2 },
				{ humidity: 22, temperature: 27, elevation: 3 },
				{ humidity: 23, temperature: 28, elevation: 2 }
			] // array length is limited by 'indexType'
		}
		*/

		var subProtocolConfig = {
			'humidity': nengi.UInt8,
			'temperature': nengi.Int8,
			'elevation': nengi.UInt8
		}

		var subProtocol = new nengi.Protocol(subProtocolConfig)

		var protocolConfig = {
			'tiles': { type: subProtocol, indexType: nengi.UInt8 }
		}

		var protocol = new nengi.Protocol(protocolConfig)	

		expect(protocol.properties['tiles'].protocol).toEqual(subProtocol)
		expect(protocol.properties['tiles'].protocol.properties['humidity'].type).toEqual(nengi.UInt8)
		expect(protocol.properties['tiles'].protocol.properties['temperature'].type).toEqual(nengi.Int8)
	})












	it('k', function() {
		var bb = new BitBuffer(8)
		bb.writeUInt8(256)
		console.log(bb.readUInt8(0))
	})
})