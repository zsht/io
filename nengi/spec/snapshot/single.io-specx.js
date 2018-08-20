var countSinglePropBits = require('../../core/snapshot/writer/countSinglePropsBits')
var countCreateEntityBits = require('../../core/snapshot/writer/countCreateEntitiesBits')
var writeSingleProps = require('../../core/snapshot/writer/writeSingleProps')
var readSingleProps = require('../../core/snapshot/reader/readSingleProps')
var writeCreateEntities = require('../../core/snapshot/writer/writeCreateEntities')
var readCreateEntities = require('../../core/snapshot/reader/readCreateEntities')
var Chunk = require('../../core/snapshot/Chunk').Chunk
var chunkType = require('../../core/snapshot/Chunk').chunkType

var Binary = require('../../core/binary/Binary')
var BitBuffer = require('../../core/binary/BitBuffer')
var BitStream = require('../../core/binary/BitStream')

var Client = require('../../core/instance/Client')
var EntityCache = require('../../core/instance/EntityCache')

var nengi = require('../../')

/* tests the CreateEntities chunk of game snapshots */
xdescribe('singleProps write/read', () => {

    it('untitled', () => {
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
            entity: [protocol0, protocol1],
            localEvent: []
        }

        // create an instance and add the entities
        var instance = new nengi.Instance(protocols)
        instance.addEntity(entity0)
        instance.addEntity(entity1)
        instance.addEntity(entity2)

        var sv_client = new Client()
        instance.addClient(sv_client)

        /* we must send one tick of data before testing entity updates, because
        * entity updates are only valid for already known entities */
        /* begin firt tick of data */
        // manually advancing the game simulation for the sake of the test
        // tick 0
        instance.historian.record(
            0, 
            instance.entities.toArray(),
            instance.localEvents,
            null
        )
        var spatialStructure = instance.historian.getSnapshot(0)
        var snapshot = instance.createSnapshot(0, sv_client, spatialStructure)
        sv_client.saveSnapshot(snapshot)


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

        var cl_snapshot = {
            createEntities: clientEntities,
            updateEntities: {
                partial: [],
                optimized: []
            },
            deleteEntities:[]
        }

        var mockClient = new EntityCache()
        mockClient.saveSnapshot(cl_snapshot)
        /* end first tick of data */

        /* begin second tick */
        // change state, these state changes will be updated using the
        // 'partial' 'singleProp' netcode
        entity0.x += 5
        entity1.x += 6
        entity2.x += 7
        entity2.armorType = 2
        entity0.hp = 33

        // tick 1
        instance.historian.record(
            1, 
            instance.entities.toArray(),
            instance.localEvents,
            null
        )
        var spatialStructure = instance.historian.getSnapshot(1)
        var snapshot = instance.createSnapshot(1, sv_client, spatialStructure)
        sv_client.saveSnapshot(snapshot)


        // create a bitBuffer and write the entities
        var bits = countSinglePropBits(snapshot.updateEntities.partial)
        var bitBuffer = new BitBuffer(bits)
        var writeStream = new BitStream(bitBuffer)
        writeSingleProps(writeStream, snapshot.updateEntities.partial)

        // create a client and read the entities
        var client = new nengi.Client(protocols)
        var readStream = new BitStream(bitBuffer)
        var messageType = readStream.readUInt8()
        var singleProps = readSingleProps(readStream, mockClient)

        var cl_snapshot = {
            createEntities: [],
            updateEntities: {
                partial: singleProps,
                optimized: []
            },
            deleteEntities:[]
        }
        mockClient.saveSnapshot(cl_snapshot)
        /* end second tick */

        // the serverside state should equal the clientside state
        expect(sv_client.entityCache).toEqual(mockClient)
    })
})