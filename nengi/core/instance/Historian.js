//var Grid = require('./Grid')
var EDictionary = require('../../external/EDictionary')
var SpatialStructure = require('./BasicSpace')

var lerp = function(a, b, portion) {
  return a + ((b - a) * portion)
}

function Historian(tickRate) {
    this.history = {}
    this.tick = -1
    this.tickRate = tickRate
}

Historian.prototype.getSnapshot = function(tick) {
    if (this.history[tick]) {
        return this.history[tick]
    } else {
        return null
        //console.log('historian had no snapshot for tick', tick, 'current tick is', this.tick)
        //throw new Error('historian had no snapshot for tick', tick, 'current tick is', this.tick)
    }
}

Historian.prototype.record = function(tick, entities, events, boundary) {
    //console.log('recording...', entities)
    var spatialStructure = SpatialStructure.create() 

    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i]
        spatialStructure.insertEntity({
            id: entity.id,
            x: entity.x,
            y: entity.y,
            ref: entity
        })
    }

    for (var i = 0; i < events.length; i++) {
        var event = events[i]
        spatialStructure.insertEvent(event)
    }

    this.history[tick] = spatialStructure

    if (tick > this.tick) {
        this.tick = tick
    }

    if (this.history[tick-20]) {
        this.history[tick-20].release()
        delete this.history[tick-20]
    }
}

Historian.prototype.getLagCompensatedArea = function(timeAgo, aabb) {
    //console.log(timeAgo)
    var tickLengthMs = 1000/this.tickRate
    var ticksAgo = timeAgo / tickLengthMs

    var olderTick = this.tick - Math.floor(ticksAgo)
    var newerTick = this.tick - Math.floor(ticksAgo) + 1
    var portion = (timeAgo % tickLengthMs)/tickLengthMs

    var timesliceA = this.getSnapshot(olderTick)
    var timesliceB = this.getSnapshot(newerTick)

    var compensatedEntities = []

    if (timesliceA && timesliceB) {
        var entitiesA = timesliceA.queryAreaEMap(aabb)
        var entitiesB = timesliceB.queryAreaEMap(aabb)

        entitiesA.forEach(entityA => {
            var entityB = entitiesB.get(entityA.id)

            if (entityA && entityB) {
                var compensatedEntity = {
                    id: entityA.id,
                    x: lerp(entityA.x, entityB.x, portion),
                    y: lerp(entityA.y, entityB.y, portion)
                }

                compensatedEntities.push(compensatedEntity)
            }
        })
    }

    return compensatedEntities
}

Historian.prototype.getCurrentState = function() {
    return this.getSnapshot(this.tick)
}

Historian.prototype.getRecentEvents = function() {
    var spatialStructure = this.getSnapshot(this.tick)
}

Historian.prototype.getRecentSnapshot = function() {
    return this.getSnapshot(this.tick)
}

module.exports = Historian