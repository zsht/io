const EDictionary = require('../../external/EDictionary')
const compareArrays = require('./compareArrays')

let ID
let PARENT_ID
let TYPE

//let each = (e, c)

class Components {
    constructor(instance) {
        this.instance = instance
        this.components = new EDictionary()
        this.addedComponentsByEntityId = {}
        this.removedComponentsByEntityId = {}

        ID = instance.config.ID_PROPERTY_NAME
        PARENT_ID = instance.config.PARENT_ID_PROPERTY_NAME
        TYPE = instance.config.TYPE_PROPERTY_NAME

        this.prevFrame = {}
        this.deltas = {}
    }

    process() {        
        let currFrame = {}
        this.instance.entities.forEach(entity => {
            currFrame[entity.id] = []
            
            if (!entity.components) {
                return
            }

            entity.components.forEach(c => {
                if (this.isNetworkable(c)) {
                    this.addComponent(c)
                    currFrame[entity.id].push(c.id)
                }                
            })
            this.deltas[entity.id] = compareArrays(currFrame[entity.id], this.prevFrame[entity.id] || [])


            for (var i = 0; i < this.deltas[entity.id].bOnly.length; i++) {
                let component = this.components.get(this.deltas[entity.id].bOnly[i])
                this.removeComponent(component)
            }

            this.prevFrame[entity.id] = currFrame[entity.id]
        })

        //console.log(this.deltas, this.components.toArray().length)
    }

    clear() {
        this.deltas = {}
    }

    isNetworkable(c) {
        return this.instance.protocols.getProtocol(c[TYPE])
    }

    getCreateComponents(entity) {
        return this.deltas[entity.id].aOnly
    }

    getUpdateComponents(entity) {
        return this.deltas[entity.id].both
    }

    getDeleteComponents(entity) {
        return this.deltas[entity.id].bOnly
    }

    addComponent(component) {
        if (component[ID] && component[ID] !== -1) {
            return
        }

        component[PARENT_ID] = component.parent[ID]
        component[ID] = this.instance.entityIdPool.nextId()
        component.protocol = this.instance.protocols.getProtocol(component[TYPE])
        this.components.add(component)
        //console.log('ins added', component[ID], component.constructor.name)
        return component
    }

   removeComponent(component) {
        if (component[ID] === -1) {
            //throw new Error('Tried to remove a component that was already removed.')
        }
        this.components.remove(component)
        this.instance.entityIdPool.queueReturnId(component[ID])
        //console.log('ins removed', component[ID],  component.constructor.name)
        component[PARENT_ID] = -1
        component[ID] = -1
        return component
    }

    addEntity(entity) {    
        //console.log('add entity', entity.constructor.name, entity.components.size)
        if (entity.protocol.components && entity.protocol.components.mode === 'Map') {
            entity.components.forEach(c => {
                if (this.isNetworkable(c)) {
                    this.addComponent(c)
                }
            })
        }
    }

    removeEntity(entity) {
        //console.log('remove entity')
        if (entity.protocol.components && entity.protocol.components.mode === 'Map') {
            entity.components.forEach(c => {
                this.removeComponent(c)
            })
        }
    }

    snapshotDecorate(snapshot) {
        snapshot.createComponents = []
        snapshot.deleteComponents = []
        snapshot.updateComponents = {
            partial: []
        }
    }

    snapshotCreateEntity(entity, snapshot, tick) {
        if (entity.protocol.components && entity.protocol.components.mode === 'Map') {
            entity.components.forEach(c => {
                if (this.isNetworkable(c)) {
                    let proxy = this.instance.proxifyOrGetCachedProxy(tick, c)
                    proxy.protocol = c.protocol
                    snapshot.createComponents.push(proxy)
                    //console.log('create via entity', c.id, c.constructor.name)
                }
            })
        }
    }

    snapshotUpdateEntity(entity, snapshot, tick) {
        if (entity.protocol.components && entity.protocol.components.mode === 'Map') {


            let creates = this.getCreateComponents(entity)

            for (var i = 0; i < creates.length; i++) {               
                let c = this.components.get(creates[i])
                let proxy = this.instance.proxifyOrGetCachedProxy(tick, c)
                proxy.protocol = c.protocol
                snapshot.createComponents.push(proxy)
                //console.log('create up', cid, c.constructor.name)
            }

            let updates = this.getUpdateComponents(entity)

            for (var i = 0; i < updates.length; i++) {
                let c = this.components.get(updates[i])
                let proxy = this.instance.proxifyOrGetCachedProxy(tick, c)

                for (var j = 0; j < proxy.diff.singleProps.length; j++) {
                    snapshot.updateComponents.partial.push(proxy.diff.singleProps[j])
                }
                
            }

            let deletes = this.getDeleteComponents(entity)
  
            for (var i = 0; i < deletes.length; i++) {   
                //console.log('delete up', cid)
                snapshot.deleteComponents.push(deletes[i])
            }
        }
    }

    snapshotDeleteEntity(entity, snapshot) {
        return // assume that clients will delete components when an entity is deleted
        /*
        if (entity.protocol.components && entity.protocol.components.mode === 'Map') {
            entity.components.forEach(c => {
                if (this.isNetworkable(c)) {
                    console.log('delete via entity', c.id)
                    snapshot.deleteComponents.push(c.id)
                }
            })
        }
        */
    }
}

module.exports = Components