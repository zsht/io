var copyProxy = require('../protocol/copyProxy')
var setValue = require('../protocol/setValue')
var getValue = require('../protocol/getValue')

function EntityCache() {
    this.state = {}
}

EntityCache.prototype.saveEntity = function(entity, protocol) {
    var copy = copyProxy(entity, protocol)
    copy.protocol = entity.protocol
    this.state[entity.id] = copy
}

EntityCache.prototype.deleteEntity = function(id) {
    delete this.state[id]
}

EntityCache.prototype.updateEntityPartial = function(id, path, value) {
    setValue(this.state[id], path, value)

}

EntityCache.prototype.updateEntityOptimized = function(id, path, deltaValue) {
    var value = getValue(this.state[id], path)
    setValue(this.state[id], path, value + deltaValue)
}

EntityCache.prototype.getEntity = function(id) {
    return this.state[id]
}

EntityCache.prototype.saveSnapshot = function(snapshot, protocols) { 

    for (var i = 0; i < snapshot.createEntities.length; i++) {
        var entity = snapshot.createEntities[i]
        this.saveEntity(entity, entity.protocol)
    }

    for (var i = 0; i < snapshot.updateEntities.partial.length; i++) {
        var partial = snapshot.updateEntities.partial[i]
        this.updateEntityPartial(
            partial.id, 
            partial.path, 
            partial.value
        )
    }

    for (var i = 0; i < snapshot.updateEntities.optimized.length; i++) {
        var optimized = snapshot.updateEntities.optimized[i]
        optimized.updates.forEach(microOpt => {
            if (microOpt.isDelta) {
                // deltaValue
                this.updateEntityOptimized(
                    optimized.id,
                    microOpt.path,
                    microOpt.value
                )
            } else {
                // exact value
                this.updateEntityPartial(
                    optimized.id, 
                    microOpt.path,
                    microOpt.value
                )
            }
        })
    }

    for (var i = 0; i < snapshot.deleteEntities.length; i++) {
        var id = snapshot.deleteEntities[i]
        this.deleteEntity(id)
    }



    for (var i = 0; i < snapshot.createComponents.length; i++) {
        var entity = snapshot.createComponents[i]
        this.saveEntity(entity, entity.protocol)
    }

    for (var i = 0; i < snapshot.updateComponents.partial.length; i++) {
        var partial = snapshot.updateComponents.partial[i]
        this.updateEntityPartial(
            partial.id, 
            partial.path, 
            partial.value
        )
    }


    for (var i = 0; i < snapshot.deleteComponents.length; i++) {
        var id = snapshot.deleteComponents[i]
        this.deleteEntity(id)
    }

}

module.exports = EntityCache