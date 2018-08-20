
// the most basic spatial structure that will work with nengi's instance
var EDictionary = require('../../external/EDictionary')

function BasicSpace() {
    this.entities = new EDictionary()
    this.events = new EDictionary()
}

BasicSpace.create = function() {
    return new BasicSpace()
}

BasicSpace.prototype.insertEntity = function(entity) {
    this.entities.add(entity)
}

BasicSpace.prototype.insertEvent = function(event) {
    this.events.add(event)    
}

BasicSpace.prototype.queryAreaEMap = function(aabb) {
    var minX = aabb.x - aabb.halfWidth
    var minY = aabb.y - aabb.halfHeight
    var maxX = aabb.x + aabb.halfWidth
    var maxY = aabb.y + aabb.halfHeight

    var entitiesInArea = new Map()

    var entities = this.entities.toArray()
    
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i]

        if (entity.x <= maxX 
            && entity.x >= minX 
            && entity.y <= maxY 
            && entity.y >= minY) {

            entitiesInArea.set(entity.id, entity)
        }
    }
    return entitiesInArea
}

BasicSpace.prototype.queryArea = function(aabb) {
    var minX = aabb.x - aabb.halfWidth
    var minY = aabb.y - aabb.halfHeight
    var maxX = aabb.x + aabb.halfWidth
    var maxY = aabb.y + aabb.halfHeight

    var entitiesInArea = []
    var eventsInArea = []

    var entities = this.entities.toArray()

    for (var i = 0; i < entities.length; i++) {
    	var entity = entities[i]

    	if (entity.x <= maxX 
    		&& entity.x >= minX 
    		&& entity.y <= maxY 
    		&& entity.y >= minY) {

    		entitiesInArea.push(entity)
    	}
    }

    var events = this.events.toArray()

    for (var i = 0; i < events.length; i++) {
    	var event = events[i]

    	if (event.x <= maxX 
    		&& event.x >= minX 
    		&& event.y <= maxY 
    		&& event.y >= minY) {

    		eventsInArea.push(event)
    	}
    }
    return { entities: entitiesInArea, events: eventsInArea}
}

BasicSpace.prototype.release = function() {

}

module.exports = BasicSpace