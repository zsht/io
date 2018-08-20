var WorldState = require('../../core/client/WorldState')
var nengi = require('../../')

describe('WorldState', () => {

    var simpleEntityProtocol = new nengi.EntityProtocol({
        x: nengi.UInt16,
        y: nengi.UInt16,
        hp: nengi.UInt8
    })

    var simpleMessageProtocol = new nengi.MessageProtocol({
        text: nengi.ASCIIString
    })

    var simpleLocalEventProtocol = new nengi.LocalEventProtocol({
        x: nengi.UInt16,
        y: nengi.UInt16,
        abilityType: nengi.UInt4
    })


    it('understands snapshot.createEntities', () => {
        var mockSnapshotA = {
            tick: 0,
            timestamp: Date.now(),
            localEvents: [],
            messages: [],
            jsons: [],
            createEntities: [],
            deleteEntities: [],
            updateEntities: {
                partial: [],
                optimized: []
            }
        }

        mockSnapshotA.createEntities.push({
            type: 0,
            id: 0,            
            x: 50,
            y: 50,
            hp: 100,
            protocol: simpleEntityProtocol
        })

        mockSnapshotA.createEntities.push({
            type: 0,
            id: 1,
            x: 51,
            y: 51,
            hp: 75,
            protocol: simpleEntityProtocol
        })

        var worldStateA = new WorldState(0, mockSnapshotA)

        // equal entities
        expect(worldStateA.entities.get(0)).toEqual(mockSnapshotA.createEntities[0])
        expect(worldStateA.entities.get(1)).toEqual(mockSnapshotA.createEntities[1])

        // recorded ids of entities created this snapshot
        expect(worldStateA.createdEntityIds).toEqual([0, 1])
    })


    it('understands snapshot.updateEntities', () => {

        // first snapshot where entities are created
        var mockSnapshotA = {
            tick: 0,
            timestamp: Date.now(),
            localEvents: [],
            messages: [],
            jsons: [],
            createEntities: [],
            deleteEntities: [],
            updateEntities: {
                partial: [],
                optimized: []
            }
        }

        mockSnapshotA.createEntities.push({
            type: 0,
            id: 0,            
            x: 50,
            y: 50,
            hp: 100,
            protocol: simpleEntityProtocol
        })

        mockSnapshotA.createEntities.push({
            type: 0,
            id: 1,
            x: 51,
            y: 51,
            hp: 75,
            protocol: simpleEntityProtocol
        })

        var worldStateA = new WorldState(0, mockSnapshotA)

        // second snapshot where entities are updated with new data
        var mockSnapshotB = {
            tick: 1,
            timestamp: Date.now() + 100,
            localEvents: [],
            messages: [],
            jsons: [],
            createEntities: [],
            deleteEntities: [],
            updateEntities: {
                partial: [],
                optimized: []
            }
        }

        // testing both types of updates
        mockSnapshotB.updateEntities.partial.push({
            id: 0, prop: 'x', path: ['x'], value: 55
        })

        mockSnapshotB.updateEntities.optimized.push({
            id: 1,
            updates: [
                { isDelta: true, prop: 'x', path: ['x'], value: 5 },
                { isDelta: true, prop: 'y', path: ['y'], value: 5 }
            ]
        })

        var worldStateB = new WorldState(1, mockSnapshotB, worldStateA)

        expect(worldStateB.entities.get(0).x).toEqual(55)
        expect(worldStateB.entities.get(1).x).toEqual(56)
        expect(worldStateB.entities.get(1).y).toEqual(56)

        expect(worldStateB.updatedEntityIds).toEqual([0, 1])    
    })

    it('understands snapshot.deleteEntities', () => {

        // first snapshot where entities are created
        var mockSnapshotA = {
            tick: 0,
            timestamp: Date.now(),
            localEvents: [],
            messages: [],
            jsons: [],
            createEntities: [],
            deleteEntities: [],
            updateEntities: {
                partial: [],
                optimized: []
            }
        }

        mockSnapshotA.createEntities.push({
            type: 0,
            id: 0,            
            x: 50,
            y: 50,
            hp: 100,
            protocol: simpleEntityProtocol
        })

        mockSnapshotA.createEntities.push({
            type: 0,
            id: 1,
            x: 51,
            y: 51,
            hp: 75,
            protocol: simpleEntityProtocol
        })

        var worldStateA = new WorldState(0, mockSnapshotA)

        // second snapshot where one entity is deleted
        var mockSnapshotB = {
            tick: 1,
            timestamp: Date.now() + 100,
            localEvents: [],
            messages: [],
            jsons: [],
            createEntities: [],
            deleteEntities: [],
            updateEntities: {
                partial: [],
                optimized: []
            }
        }

        mockSnapshotB.deleteEntities.push(0)

        var worldStateB = new WorldState(1, mockSnapshotB, worldStateA)

        expect(worldStateB.entities.get(0)).toBe(null)
        // checking a property from entity#1 to confirm it is still there
        expect(worldStateB.entities.get(1).x).toEqual(51)

        // entity#0 was deleted
        expect(worldStateB.deletedEntityIds).toEqual([0])    
    })

    it('understands snapshot.localEvents', () => {
        var mockSnapshotA = {
            tick: 0,
            timestamp: Date.now(),
            localEvents: [],
            messages: [],
            jsons: [],
            createEntities: [],
            deleteEntities: [],
            updateEntities: {
                partial: [],
                optimized: []
            }
        }

        mockSnapshotA.localEvents.push({
            type: 0,
            x: 50,
            y: 50,
            abilityType: 6,
            protocol: simpleLocalEventProtocol
        })

        var worldStateA = new WorldState(0, mockSnapshotA)

        expect(worldStateA.localEvents[0]).toEqual(mockSnapshotA.localEvents[0])
    })

    it('understands snapshot.messages', () => {
        var mockSnapshotA = {
            tick: 0,
            timestamp: Date.now(),
            localEvents: [],
            messages: [],
            jsons: [],
            createEntities: [],
            deleteEntities: [],
            updateEntities: {
                partial: [],
                optimized: []
            }
        }

        mockSnapshotA.messages.push({
            type: 0,
            text: "hello world",
            protocol: simpleMessageProtocol
        })

        var worldStateA = new WorldState(0, mockSnapshotA)

        expect(worldStateA.messages[0]).toEqual(mockSnapshotA.messages[0])
    })
})