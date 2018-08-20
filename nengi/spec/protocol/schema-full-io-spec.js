var nengi = require('../../')
var Binary = require('../../core/binary/Binary')

var proxify = require('../../core/protocol/proxify')
var deproxify = require('../../core/protocol/deproxify')
var write = require('../../core/protocol/write/writeMessage')
var read = require('../../core/protocol/read/readMessage')

var BitBuffer = require('../../core/binary/BitBuffer')
var BitStream = require('../../core/binary/BitStream')



/*
* These tests write objects (via their protocols) to a buffer and then
* read those objects out of the buffer. These are designed to be an
* approximation of the full network process from creation of a game object
* on the server to receiving the data on the client.
*/
describe('game-related protocol tests including read/write to buffer', function() {

	it('read/write simple example', function() {
		// protocol for an orc, shared on server and client
		var orcProtocol = new nengi.Protocol({
			'x': nengi.Int16,
			'y': nengi.Int16,
			'hp': nengi.UInt8,
			'isAggro': nengi.Boolean
		})
		
		// an orc, on the server
		var serverOrc = {
			x: -3450,
			y: 534,
			hp: 100,
			isAggro: false
		}

		// serialized representation of serverOrc
		var serializedOrc = proxify(serverOrc, orcProtocol)

		// simulated writing of data to the buffer as would occur on the server
		var buffer = new Buffer(4096) // overkill size
		var bitBuffer = new BitBuffer(buffer)
		var writeStream = new BitStream(bitBuffer)
		write(writeStream, serializedOrc, orcProtocol)

		// a check to make sure that the representation of the orc was optimized 
		// using the types in the protocol, in this case 41 bits (16 + 16 + 8 + 1)
		var expectedSizeInBits = Binary[nengi.Int16].bits 
			+ Binary[nengi.Int16].bits
			+ Binary[nengi.UInt8].bits
			+ Binary[nengi.Boolean].bits

		expect(expectedSizeInBits).toEqual(writeStream.offset)
		expect(expectedSizeInBits).toEqual(41)

		// simulated reading of data from the buffer as would occur on the client
		var readStream = new BitStream(bitBuffer)
		var clientsideSerializedOrc = read(readStream, orcProtocol)
		// unserialized 
		var clientOrc = deproxify(clientsideSerializedOrc, orcProtocol)

		// expect that the serverOrc and clientOrc contain the same data
		expect(serverOrc.x).toEqual(clientOrc.x)
		expect(serverOrc.y).toEqual(clientOrc.y)
		expect(serverOrc.hp).toEqual(clientOrc.hp)
		expect(serverOrc.isAggro).toEqual(clientOrc.isAggro)
	})

	it('read/write object containing an array of numbers', function() {
		/* This example is themed around a 10x10 tile map */
		// helper for making random  map data
		function getRandomIntInclusive(min, max) {
			min = Math.ceil(min)
			max = Math.floor(max)
			return Math.floor(Math.random() * (max - min + 1)) + min
		}

		// protocol for a map of tiles whose values are 0-255
		var mapProtocol = new nengi.Protocol({
			'width': nengi.Int16,
			'height': nengi.Int16,
			'tileData': { type: nengi.UInt8, indexType: nengi.UInt8 }
		})
		
		// the map, on the server
		var serverMap = {
			width: 10,
			height: 10,
			tileData: []
		}

		// populate with random data
		for (var i = 0; i < 100; i++) {
			serverMap.tileData.push(getRandomIntInclusive(0, 255))
		}

		var serializedMap = proxify(serverMap, mapProtocol)
		// width + height + array length + (array contents)
		var expectedSizeInBits = 16 + 16 + 8 + (100 * 8)
		var buffer = new Buffer(expectedSizeInBits)
		var bitBuffer = new BitBuffer(buffer)
		var writeStream = new BitStream(bitBuffer)
		write(writeStream, serializedMap, mapProtocol)		

		expect(expectedSizeInBits).toEqual(writeStream.offset)


		// simulated reading of data from the buffer as would occur on the client
		var readStream = new BitStream(bitBuffer)
		var clientsideSerializedMap = read(readStream, mapProtocol)
		// unserialized 
		var clientMap = deproxify(clientsideSerializedMap, mapProtocol)

		// expect that the serverOrc and clientOrc contain the same data
		expect(serverMap.width).toEqual(clientMap.width)
		expect(serverMap.height).toEqual(clientMap.height)
		for (var i = 0; i < 100; i++) {
			expect(serverMap.tileData[i]).toEqual(clientMap.tileData[i])
		}
	})


	it('read/write floats and strings', function() {
		// protocol for an orc, shared on server and client
		var orcProtocol = new nengi.Protocol({
			'x': nengi.Int16,
			'y': nengi.Int16,
			'pi': nengi.Float64,
			'name': nengi.ASCIIString
		})
		
		// an orc, on the server
		var serverOrc = {
			x: -3450,
			y: 534,
			pi: Math.PI,
			name: 'Bob' + Math.random()
		}

		// serialized representation of serverOrc
		var serializedOrc = proxify(serverOrc, orcProtocol)
		// simulated writing of data to the buffer as would occur on the server
		var buffer = new Buffer(4096) // overkill size
		var bitBuffer = new BitBuffer(buffer)
		var writeStream = new BitStream(bitBuffer)
		write(writeStream, serializedOrc, orcProtocol)

		// simulated reading of data from the buffer as would occur on the client
		var readStream = new BitStream(bitBuffer)
		var clientsideSerializedOrc = read(readStream, orcProtocol)
		// unserialized 
		var clientOrc = deproxify(clientsideSerializedOrc, orcProtocol)

		// expect that the serverOrc and clientOrc contain the same data
		expect(serverOrc.x).toEqual(clientOrc.x)
		expect(serverOrc.y).toEqual(clientOrc.y)
		expect(serverOrc.pi).toEqual(clientOrc.pi)
		expect(serverOrc.name).toEqual(clientOrc.name)
	})

	it('read/write an array of strings', function() {
		// protocol for an orc, shared on server and client
		var orcProtocol = new nengi.Protocol({
			'x': nengi.Int16,
			'y': nengi.Int16,
			'pi': nengi.Float64,
			'names':  { type: nengi.ASCIIString, indexType: nengi.UInt8 }
		})
		
		// an orc, on the server
		var serverOrc = {
			x: -3450,
			y: 534,
			pi: Math.PI,
			names: ['foo', 'bar', 'baz']
		}

		// serialized representation of serverOrc
		var serializedOrc = proxify(serverOrc, orcProtocol)
		// simulated writing of data to the buffer as would occur on the server
		var buffer = new Buffer(4096) // overkill size
		var bitBuffer = new BitBuffer(buffer)
		var writeStream = new BitStream(bitBuffer)
		write(writeStream, serializedOrc, orcProtocol)

		// simulated reading of data from the buffer as would occur on the client
		var readStream = new BitStream(bitBuffer)
		var clientsideSerializedOrc = read(readStream, orcProtocol)
		// unserialized 
		var clientOrc = deproxify(clientsideSerializedOrc, orcProtocol)

		// expect that the serverOrc and clientOrc contain the same data
		expect(serverOrc.x).toEqual(clientOrc.x)
		expect(serverOrc.y).toEqual(clientOrc.y)
		expect(serverOrc.pi).toEqual(clientOrc.pi)
		expect(serverOrc.names).toEqual(clientOrc.names)
	})
})

