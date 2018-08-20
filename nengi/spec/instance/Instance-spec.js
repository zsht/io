var nengi = require('../../')
//var config = require('../../config')
//nengi.configure(config)
var Instance = nengi.Instance

var Client = require('../../core/instance/Client')

// an empty protocol config
var protocols =  { 

}


describe('Instance', function() {
	it('can add clients and give them ids', function() {
		var instance = new Instance(protocols)

		var client1 = {
			foo: 'I am a mock client'
		}		

		var client2 = {
			foo: 'I am a mock client'
		}

		instance.addClient(client1)
		instance.addClient(client2)

		expect(instance.getClient(client1.id)).toBe(client1)
		expect(instance.getClient(client2.id)).toBe(client2)
	})

	it('can add entities and give them ids', function() {
		var instance = new Instance(protocols)

		var entity1 = {
			x:  50,
			y:  50
		}		

		var entity2 = {
			x: 140,
			y: 230
		}

		instance.addEntity(entity1)
		instance.addEntity(entity2)

		expect(entity1.id).toBeDefined()
		expect(entity2.id).toBeDefined()
		expect(entity1.id).not.toEqual(entity2.id)
		expect(instance.getEntity(entity1.id)).toBe(entity1)
		expect(instance.getEntity(entity2.id)).toBe(entity2)
	})


	it('client can see nearby entities', function() {
		var instance = new Instance(protocols)

		var client = {
			view: {
				x: 0,
				y: 0,
				halfWidth: 300,
				halfHeight: 300
			}
		}

		var entity1 = {
			x: 50,
			y: 50
		}		

		var entity2 = {
			x: 140,
			y: 230
		}

		// this entity is out of the client view
		var entity3 = {
			x: 350,
			y: 350
		}

		instance.addEntity(entity1)
		instance.addEntity(entity2)
		instance.addEntity(entity3)

		// done automatically by nengi, manually invoked for this test
		instance.historian.record(
			instance.tick++, 
			instance.entities.toArray(), 
			instance.localEvents
		)

		// retrieve the data structure containing the entities
		var spatialState = instance.historian.getCurrentState()

		// entities within the client's view
		var visibileEntities = spatialState.queryArea(client.view).entities

		// length should be 2, because entity3 was not within the view
		expect(visibileEntities.length).toBe(2)

		// these are copies of the entities, not the actual entities
		expect(visibileEntities[0]).not.toBe(entity1)
		expect(visibileEntities[1]).not.toBe(entity2)

		// copies have same position as the real entities
		// NOTE: this is only true until the real entity moves
		expect(visibileEntities[0].x).toBe(entity1.x)
		expect(visibileEntities[0].y).toBe(entity1.y)
		expect(visibileEntities[1].x).toBe(entity2.x)
		expect(visibileEntities[1].y).toBe(entity2.y)

		// copies refer to the entity
		expect(visibileEntities[0].ref).toBe(entity1)
		expect(visibileEntities[1].ref).toBe(entity2)
	})

	it('visibility: newlyVisible, stillVisible, noLongerVisible', function() {
		var instance = new Instance(protocols)

		var client = new Client()

        // entity1 and 2 are within the client's initial view
		var entity1 = {
			x: 50,
			y: 50
		}

		var entity2 = {
			x: 140,
			y: 230
		}

		// this entity is out of the client view
		var entity3 = {
			x: 350,
			y: 350
		}

		instance.addClient(client)
		instance.addEntity(entity1)
		instance.addEntity(entity2)
		instance.addEntity(entity3)

		// record spatial data
		instance.historian.record(
			0, 
			instance.entities.toArray(), 
			instance.localEvents
		)

		var spatialState = instance.historian.getCurrentState()
		var nearby = spatialState.queryArea(client.view)
	    var entityIds = []
	    for (var i = 0; i < nearby.entities.length; i++) {
	        entityIds.push(nearby.entities[i].id)
	    }
		var visibility = instance.checkVisibility(client, entityIds)
		
		// expect the visibility to contain entity1,2, but not 3
		expect(visibility.newlyVisible.indexOf(entity1.id)).not.toBe(-1)
		expect(visibility.newlyVisible.indexOf(entity2.id)).not.toBe(-1)
		expect(visibility.newlyVisible.indexOf(entity3.id)).toBe(-1)

		// move entity3 to within the client's view
		entity3.x = 60
		entity3.y = 60

        // move entity 1 out of the client's view
        entity1.x = 99999
        entity1.y = 99999

		// record spatial data
		instance.historian.record(
			1, 
			instance.entities.toArray(), 
			instance.localEvents
		)

		// repeat calculations from earlier
		var spatialState = instance.historian.getCurrentState()
		var nearby = spatialState.queryArea(client.view)
	    var entityIds = []
	    for (var i = 0; i < nearby.entities.length; i++) {
	        entityIds.push(nearby.entities[i].id)
	    }
		var visibility = instance.checkVisibility(client, entityIds)

		// entity 3 is now newly visible as of this frame
		expect(visibility.newlyVisible.indexOf(entity3.id)).not.toBe(-1)

		// entity 2 is still visible
		expect(visibility.stillVisible.indexOf(entity2.id)).not.toBe(-1)
		
        // entity 1 is no longer visible
        expect(visibility.noLongerVisible.indexOf(entity1.id)).not.toBe(-1)


	})

    it('aaa', function() {

		var client = new Client()

		var entity1 = {
			x: 50,
			y: 50,
			hp: 100
		}

		var entity2 = {
			x: 150,
			y: 150,
			hp: 100
		}

		var entity3 = {
			x: 150,
			y: 150,
			mana: 100
		}

		var protocol = new nengi.EntityProtocol({
			x: nengi.Int16,
			y: nengi.Int16,
			hp: nengi.UInt8
		}, {
			x: { delta: true, type: nengi.Int8 },
			y: { delta: true, type: nengi.Int8 }
		})

		var protocol2 = new nengi.EntityProtocol({
			x: nengi.Int16,
			y: nengi.Int16,
			mana: nengi.UInt8
		}, {
			x: { delta: true, type: nengi.Int8 },
			y: { delta: true, type: nengi.Int8 }
		})

		entity1.protocol = protocol
		entity2.protocol = protocol
		entity3.protocol = protocol2

		// reconfigure nengi to load protocols for this test
        var protocols = {
            'p1': protocol,
            'p2': protocol2
        }


		var instance = new Instance(protocols)

		return
		instance.addClient(client)
		instance.addEntity(entity1)
		instance.addEntity(entity2)
		instance.addEntity(entity3)
        //instance.update()
        entity1.x += 3
        entity1.y -= 5
        entity1.hp = 75
        entity2.hp = 65
        //instance.update()
        entity2.y -= 200
        //instance.update()
        instance.removeEntity(entity2)
        entity1.x += 13
        //instance.update()
        return
		



		//instance.removeEntity(entity1)
		//entity2.x += 0
		instance.update()
		instance.update()
		instance.update()
		instance.update()
	})

})