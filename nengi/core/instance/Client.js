var EntityCache = require('./EntityCache')
var compareArrays = require('./compareArrays')
var LatencyRecord = require('./LatencyRecord')

function Client() {
    this.accepted = false
	this.id = -1
    this.lastReceivedDataTimestamp = Date.now()
    this.lastReceivedTick = -1
    this.lastProcessedClientTick = -1
    this.latency = 100

    this.transferKey = -1

    this.latencyRecord = new LatencyRecord()


	// websocket connection
	this.connection = null
	// area of the game world visible  to this client
	this.view = { x: 0, y: 0, halfWidth: 400, halfHeight: 300 }
    // entities currently within this client's view
    // used to evaluate changes in visibility
    this.entityIds = []
    // components currently on entities within this client's view
    // syntax: componentIds[entityId] = [componentAId, componentBId, etc]
    // used to evaluate component additions/removals from entities
    this.componentIds = {}
	this.messageQueue = []
    this.jsonQueue = []
	this.entityCache = new EntityCache()
}

Client.prototype.queueMessage = function(message) {
	this.messageQueue.push(message)
}
    
Client.prototype.queueJSON = function(json) {
    this.jsonQueue.push(json)
}




/*
Client.prototype.checkVisibility2 = function(instance, newEntities, newEvents) {

    var events = []
    var noLongerVisible = []
    var stillVisible = []
    var newlyVisible = []

    var aabb = this.view
    var minX = aabb.x - aabb.halfWidth
    var minY = aabb.y - aabb.halfHeight
    var maxX = aabb.x + aabb.halfWidth
    var maxY = aabb.y + aabb.halfHeight

    this.entityIds.forEach(id => {
        var entity = instance.getEntity(id)

        if (entity.x <= maxX 
        && entity.x >= minX 
        && entity.y <= maxY 
        && entity.y >= minY) {
            stillVisible.push(id)
        } else {
            noLongerVisible.push(id)
        }
    })

    newEvents.forEach(newEvent => {
        events.push(newEvent)
    })

    newlyVisible
}
*/

Client.prototype.checkVisibility = function(spatialStructure) {
    var nearby = spatialStructure.queryArea(this.view)
    var eventIds = []
    for (var i = 0; i < nearby.events.length; i++) {
        eventIds.push(nearby.events[i].id)
    }

    var entityIds = []
    for (var i = 0; i < nearby.entities.length; i++) {
        entityIds.push(nearby.entities[i].id)
    }

    var diffs = compareArrays(this.entityIds, entityIds)
    this.entityIds = entityIds

    return {
        events: nearby.events,
        noLongerVisible: diffs.aOnly,
        stillVisible: diffs.both,
        newlyVisible: diffs.bOnly
    }
}

// saves snapshot state to the client's entity cache
// ignores events and messages which are not persistent
Client.prototype.saveSnapshot = function(snapshot, protocols) {    
    this.entityCache.saveSnapshot(snapshot, protocols)
}

module.exports = Client