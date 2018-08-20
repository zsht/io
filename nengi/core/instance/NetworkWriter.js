
var writeEntity = require('../schema/writeEntity')
var countEntityBits = require('../schema/countEntityBits')

var writeOptimized = require('../schema/writeOptimized')
var countOptimizedBits = require('../schema/countOptimizedBits')

var writePartial = require('../schema/writePartial')
var countPartialBits = require('../schema/countPartialBits')

var writeDelete = require('../schema/writeDelete')
var countDeleteBits = require('../schema/countDeleteBits')

var BitBuffer = require('../schema/BitBuffer')
var BitStream = require('../schema/BitStream')
var Binary = require('../schema/Binary')
var BinaryType = require('../schema/BinaryType')

var proxify = require('../schema/proxify')
var compare = require('../schema/compare')

var read = require('../schema/read')

var Chunk = require('./Chunk').Chunk
var chunkType = require('./Chunk').chunkType





function Writer(instance) {
	this.instance = instance
	this.proxyCache = { }
}

Writer.prototype.proxify = function(tick, entity, schema) {
	if (this.proxyCache[tick].entities[entity.id]) {
		return this.proxyCache[tick].entities[entity.id]
	} else {
		var proxy = proxify(entity, schema)
		this.proxyCache[tick].entities[entity.id] = proxy
		return proxy
	}
}







Writer.prototype.write = function(snapshot, client) {
    console.log()
    console.log()
    console.log('WRITING BUFFER', snapshot)
    console.log()
    console.log()
	/*
	tick: tick,
    messages: [],
    events: eventIds,
    createEntities: entityVision.newlyVisible,
    updateEntities: entityVision.stillVisible,
    deleteEntities: entityVision.noLongerVisible
    */
    var bct = Binary[chunkType]


    var defaultUpdates = []
    var optimizedUpdates = []

   	var bits = 0


    if (snapshot.createEntities.length > 0) {
        bits += bct.bits
        bits += Binary[BinaryType.UInt8].bits
        snapshot.createEntities.forEach(id => {
            var entity = this.instance.getEntity(id)
            var proxy = this.instance.proxify(snapshot.tick, entity, entity.protocol)
            bits += countEntityBits(proxy, entity.protocol)
        })       
    }

    if (snapshot.updateEntities.partial.length > 0) {
        bits += bct.bits
        bits += Binary[BinaryType.UInt8].bits
        snapshot.updateEntities.partial.forEach(partialUpdate => {
            bits += countPartialBits(partialUpdate)
        })
    }

    if (snapshot.updateEntities.optimized.length > 0) {
        bits += bct.bits
        bits += Binary[BinaryType.UInt8].bits
        snapshot.updateEntities.optimized.forEach(optimizedUpdate => {       
            bits += countOptimizedBits(optimizedUpdate)
        })
    }

    if (snapshot.deleteEntities.length > 0) {
        bits += bct.bits
        bits += Binary[BinaryType.UInt8].bits
        snapshot.deleteEntities.forEach(id => {
            var entity = this.instance.getEntity(id) 
            bits += countDeleteBits(entity.protocol.properties[entity.protocol.keys[1]].type)
        })
    } 

    //var buffer = new Buffer(256)
    var bitBuffer = new BitBuffer(bits)
    var bitStream = new BitStream(bitBuffer) 

    if (snapshot.createEntities.length > 0) {
        bitStream[bct.write](Chunk.CreateEntities)
        bitStream[Binary[BinaryType.UInt8].write](snapshot.createEntities.length)
        snapshot.createEntities.forEach(id => {
            var entity = this.instance.getEntity(id)
            var proxy = this.instance.proxify(snapshot.tick, entity, entity.protocol)
            writeEntity(bitStream, proxy, entity.protocol)
            client.entityCache.saveEntity(proxy)
        })
    }

    if (snapshot.updateEntities.partial.length > 0) {
        console.log('writing partials', snapshot.updateEntities.partial.length)
        bitStream[bct.write](Chunk.UpdateEntitiesPartial)
        bitStream[Binary[BinaryType.UInt8].write](snapshot.updateEntities.partial.length)
        snapshot.updateEntities.partial.forEach(partialUpdate => { 
            console.log('partialUpdate', partialUpdate) 
            writePartial(bitStream, partialUpdate)
            //client.entityCache.updateEntityPartial(partialUpdate.id, partial.prop, partial.)
        })
    }

    if (snapshot.updateEntities.optimized.length > 0) {
        console.log('writing optimizeds', snapshot.updateEntities.optimized.length)
        bitStream[bct.write](Chunk.UpdateEntitiesOptimized)
        bitStream[Binary[BinaryType.UInt8].write](snapshot.updateEntities.optimized.length)
        snapshot.updateEntities.optimized.forEach(optimizedUpdate => {  
            console.log('writing opt', optimizedUpdate)
            writeOptimized(bitStream, optimizedUpdate)
            //client.entityCache.updateEntityOptimized(optimizedUpdate)
        })
    }

    if (snapshot.deleteEntities.length > 0) {
        bitStream[bct.write](Chunk.DeleteEntities)
        bitStream[Binary[BinaryType.UInt8].write](snapshot.deleteEntities.length)
        snapshot.deleteEntities.forEach(id => {
            var entity = this.instance.getEntity(id) 
            writeDelete(
                bitStream,
                entity.protocol.properties[entity.protocol.keys[1]].type,
                id
            )
            client.entityCache.forget(id)
        })
    }

    return bitBuffer


}



module.exports = Writer