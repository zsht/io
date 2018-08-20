var countCreateEntityBits = require('../../core/snapshot/writer/countCreateEntitiesBits')
var writeCreateEntities = require('../../core/snapshot/writer/writeCreateEntities')
var readCreateEntities = require('../../core/snapshot/reader/readCreateEntities')
var Chunk = require('../../core/snapshot/Chunk').Chunk

var Binary = require('../../core/binary/Binary')
var BitBuffer = require('../../core/binary/BitBuffer')
var BitStream = require('../../core/binary/BitStream')

// setting up the state for a hypothetical game
var nengi = require('../../')

/* tests the CreateEntities chunk of game snapshots */
describe('writer createEntities', () => {

    it('read/write three entities to bit buffer', () => {

        // hypothetical data for the test, 3 entities
        /* begin mock game data */
        var protocol0 = new nengi.EntityProtocol({
            x: nengi.Int16,
            y: nengi.Int16,
            hitpoints: nengi.UInt8
        })

        var protocol1 = new nengi.EntityProtocol({
            x: nengi.Int16,
            y: nengi.Int16,
            hitpoints: nengi.UInt8,
            armorType: nengi.UInt3
        })

        var entity0 = {
            x: 50,
            y: 50,
            hitpoints: 100,
            protocol: protocol0
        }

        var entity1 = {
            x: 60,
            y: 60,
            hitpoints: 99,
            protocol: protocol0
        }

        var entity2 = {
            id: 2,
            type: 0,
            x: 70,
            y: 70,
            hitpoints: 98,
            armorType: 1,
            protocol: protocol1
        }

        var serverEntities = []
        serverEntities.push(entity0)
        serverEntities.push(entity1)
        serverEntities.push(entity2)
        /* end mock game data */

        var protocols = {
            entities: [protocol0, protocol1],
            localEvents: [],
            messages: []
        }

        // create an instance and add the entities
        var instance = new nengi.Instance(protocols)
        instance.addEntity(entity0)
        instance.addEntity(entity1)
        instance.addEntity(entity2)
        
        // create a bitBuffer and write the entities
        var bits = countCreateEntityBits(serverEntities)
        var bitBuffer = new BitBuffer(bits)
        var writeStream = new BitStream(bitBuffer)
        writeCreateEntities(writeStream, serverEntities)


        // create a client and read the entities
        var client = new nengi.Client(protocols)
        var readStream = new BitStream(bitBuffer)
        var messageType = readStream.readUInt8()
        var clientEntities = readCreateEntities(readStream, client.protocols)   

        // the serverside entities have a reference to the instance, which if deleted
        // should make them [deep] equal the clientside entities
        serverEntities.forEach(entity => {
            delete entity.instance
        })

        expect(clientEntities).toEqual(serverEntities)
    })
})