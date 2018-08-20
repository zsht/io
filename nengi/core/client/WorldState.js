var EDictionary = require('../../external/EDictionary')
var copyProxy = require('../protocol/copyProxy')
var getValue = require('../protocol/getValue')
var setValue = require('../protocol/setValue')

function WorldState(tick, timeBetweenSnapshots, snapshot, previousWorldState) {
    this.timeBetweenSnapshots = timeBetweenSnapshots
    this.tick = tick
    this.clientTick = snapshot.clientTick
    this.raw = snapshot
    this.processed = false
   
    this.timestamp = snapshot.timestamp
    // entity state
    this.entities = new EDictionary()
    this.components = new EDictionary()

    this.noInterps = []

    this.createEntities = []
    this.updateEntities = []
    this.deleteEntities = []

    // (ids) created this snapshot
    //this.createdEntityIds = []
    // (ids) deleted this snapshot
    //this.deletedEntityIds = []
    // (ids) updates this snapshot
    //this.updatedEntityIds = []

    this.createComponents = []
    this.updateComponents = []
    this.deleteComponents = []

    // (ids) created this snapshot
    //this.createdComponentIds = []
    // (ids) deleted this snapshot
   // this.deletedComponentIds = []
    // (ids) updates this snapshot
   // this.updatedComponentIds = []

    // localMessage state
    this.localMessages = []
    // message state
    this.messages = []
    // jsons
    this.jsons = []

    this.ping = -1
    //this.temporalOffset = -1

    this.init(snapshot, previousWorldState)
}

WorldState.prototype.init = function(snapshot, previousWorldState) {
    if (previousWorldState) {
        if (this.timestamp === -1) {
            this.timestamp = previousWorldState.timestamp + this.timeBetweenSnapshots
        }

        previousWorldState.entities.forEach(entity => {
            var clone = copyProxy(entity, entity.protocol)
            clone.protocol = entity.protocol
            this.entities.add(clone)
        })

        previousWorldState.components.forEach(c=> {
            var clone = copyProxy(c, c.protocol)
            clone.protocol = c.protocol
            this.components.add(clone)
        })
    }

    snapshot.engineMessages.forEach(message => {
        this.noInterps = message.ids
    })

    snapshot.createEntities.forEach(entity => {
        //this.createdEntityIds.push(entity.id)
        var clone = copyProxy(entity, entity.protocol)
        clone.protocol = entity.protocol
        this.entities.add(clone)
        this.createEntities.push(clone)
    })

    snapshot.createComponents.forEach(c => {
        //this.createdComponentIds.push(c.id)
        var clone = copyProxy(c, c.protocol)
        clone.protocol = c.protocol
        this.components.add(clone)
        this.createComponents.push(clone)
    })

    snapshot.localMessages.forEach(localMessage => {
        var clone = copyProxy(localMessage, localMessage.protocol)
        clone.protocol = localMessage.protocol
        this.localMessages.push(clone)
    })

    snapshot.messages.forEach(message => {
        var clone = copyProxy(message, message.protocol)
        clone.protocol = message.protocol
        this.messages.push(clone)
    })

    snapshot.jsons.forEach(json => {
        this.jsons.push(JSON.parse(json))
    })

    snapshot.updateEntities.partial.forEach(singleProp => {
        //this.updatedEntityIds.push(singleProp.id)

        var entity = this.entities.get(singleProp.id)
        //entity[singleProp.prop] = singleProp.value
        setValue(entity, singleProp.path, singleProp.value)

        this.updateEntities.push({ 
            id: singleProp.id, 
            prop: singleProp.prop,
            path: singleProp.path,
            value: singleProp.value
        })
    })

    snapshot.updateEntities.optimized.forEach(batch => {
        //this.updatedEntityIds.push(batch.id)

        var entity = this.entities.get(batch.id)
        batch.updates.forEach(update => {
            if (update.isDelta) {
                var value = getValue(entity, update.path)
                setValue(entity, update.path, value + update.value)
                //entity[update.prop] += update.value
            } else {
                setValue(entity, update.path, update.value)
                //entity[update.prop] = update.value
            }

            this.updateEntities.push({ 
                id: batch.id, 
                prop: update.prop,
                path: update.path,
                value: entity[update.prop]
            })           
        })
    })

    snapshot.deleteEntities.forEach(id => {
        //this.deletedEntityIds.push(id)
        this.deleteEntities.push(id)
        /*
        let entity = this.entities.get(id)
        if (entity.components) {
            entity.components.forEach(c => {
                this.deletedComponentIds.push(c.id)
                this.deleteComponents.push(c.id)
                this.components.removeById(c.id)
            })
        }
        */
        this.entities.removeById(id)
    })


    snapshot.updateComponents.partial.forEach(singleProp => {
        //this.updatedComponentIds.push(singleProp.id)

        var c = this.components.get(singleProp.id)
        setValue(c, singleProp.path, singleProp.value)

        this.updateComponents.push({ 
            id: singleProp.id, 
            prop: singleProp.prop,
            path: singleProp.path,
            value: singleProp.value
        })
    })

    snapshot.deleteComponents.forEach(id => {
        //this.deletedComponentIds.push(id)
        this.deleteComponents.push(id)
        this.components.removeById(id)
    })
}

module.exports = WorldState