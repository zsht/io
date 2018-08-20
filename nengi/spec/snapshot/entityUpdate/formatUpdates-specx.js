
var formatUpdates = require('../../../core/snapshot/entityUpdate/formatUpdates')
var proxify = require('../../../core/protocol/proxify')

var nengi = require('../../../')
var config = require('../../../config')

xdescribe('formatUpdates', () => {

    var protocol, obj

    beforeEach(() => {
        protocol = new nengi.EntityProtocol({
            x: nengi.UInt16,
            y: nengi.UInt16,
            z: nengi.UInt16,
            hitpoints: nengi.UInt8
        }, {
            // batch
            x: { delta: true, type: nengi.Int8 },
            y: { delta: true, type: nengi.Int8 },
            z: { delta: true, type: nengi.Int8 }
        })

        obj = {
            id: 0,
            type: 0,
            x: 50,
            y: 50,
            z: 50,
            hitpoints: 100
        }
    })

    it ('can batch', () => {
        var proxyA = proxify(obj, protocol)

        obj.x += 5
        obj.y += 6
        obj.z -= 5  

        var proxyB = proxify(obj, protocol)

        var changes = formatUpdates(
            config.ID_PROPERTY_NAME,
            proxyA, 
            proxyB,
            protocol
        )

        // there should be no singleProps
        expect(changes.singleProps.length).toBe(0)

        // expect the batch change to contain x, y, z
        expect(changes.batch.id).toBe(obj.id)

        expect(changes.batch.updates[0].prop).toBe('x')
        expect(changes.batch.updates[0].value).toBe(+5)

        expect(changes.batch.updates[1].prop).toBe('y')
        expect(changes.batch.updates[1].value).toBe(+6)

        expect(changes.batch.updates[2].prop).toBe('z')
        expect(changes.batch.updates[2].value).toBe(-5)
    })

    it ('will not batch if changes exceed their binary types', () => {
        var proxyA = proxify(obj, protocol)

        // batches are atomic, and this batch has a failure
        obj.x += 128 // this change is too big for an int8
        obj.y += 6
        obj.z -= 5  

        var proxyB = proxify(obj, protocol)

        var changes = formatUpdates(
            config.ID_PROPERTY_NAME,
            proxyA, 
            proxyB,
            protocol
        )

        //  all data will now be represented using singleProps
        expect(changes.singleProps.length).toBe(3)
        expect(changes.singleProps[0].prop).toBe('x')
        expect(changes.singleProps[1].prop).toBe('y')
        expect(changes.singleProps[2].prop).toBe('z')
        expect(changes.singleProps[0].value).toBe(obj.x)
        expect(changes.singleProps[1].value).toBe(obj.y)
        expect(changes.singleProps[2].value).toBe(obj.z)

        // expect the batch to be empty
        expect(changes.batch.updates.length).toBe(0)
    })

    it ('will detect a mixed update, batch and singleProps', () => {
        var proxyA = proxify(obj, protocol)

        obj.x += 5
        obj.y += 6
        obj.z -= 5
        obj.hitpoints -= 5

        var proxyB = proxify(obj, protocol)

        var changes = formatUpdates(
            config.ID_PROPERTY_NAME,
            proxyA, 
            proxyB,
            protocol
        )

        // expect hitspoints to be categorized as a singleProp change
        expect(changes.singleProps[0].prop).toBe('hitpoints')
        expect(changes.singleProps[0].id).toBe(obj.id)
        expect(changes.singleProps[0].value).toBe(obj.hitpoints)
        expect(changes.singleProps[0].value).toBe(95)


        // expect the batch change to contain x, y, z
        expect(changes.batch.id).toBe(obj.id)

        expect(changes.batch.updates[0].prop).toBe('x')
        expect(changes.batch.updates[0].value).toBe(+5)

        expect(changes.batch.updates[1].prop).toBe('y')
        expect(changes.batch.updates[1].value).toBe(+6)

        expect(changes.batch.updates[2].prop).toBe('z')
        expect(changes.batch.updates[2].value).toBe(-5)
    })

    it ('uses valid format', () => {
        var proxyA = proxify(obj, protocol)

        obj.x += 5
        obj.y += 6
        obj.z -= 5
        obj.hitpoints -= 5

        var proxyB = proxify(obj, protocol)

        var changes = formatUpdates(
            config.ID_PROPERTY_NAME,
            proxyA, 
            proxyB,
            protocol
        )

        // expect hitspoints to be categorized as a singleProp change
        var sp = changes.singleProps[0]
        expect(sp.prop).toBe('hitpoints')
        expect(sp.id).toBe(obj.id)
        expect(sp.value).toBe(obj.hitpoints)
        expect(sp.valueType).toBe(nengi.UInt8)
        expect(sp.key).toBe(protocol.properties['hitpoints'].key)
        expect(sp.keyType).toBe(protocol.keyType)


        // expect the batch change to contain x, y, z
        expect(changes.batch.id).toBe(obj.id)
        expect(changes.batch.idType).toBe(config.ID_BINARY_TYPE)

        var x = changes.batch.updates[0]
        expect(x.prop).toBe('x')
        expect(x.isDelta).toBe(true)
        expect(x.value).toBe(5)
        expect(x.valueType).toBe(protocol.batch.properties['x'].type)
    })

    it ('can handle non-delta batch', () => {
        protocol = new nengi.EntityProtocol({
            x: nengi.UInt16,
            y: nengi.UInt16,
            z: nengi.UInt16,
            hitpoints: nengi.UInt8
        }, {
            // batch
            x: { delta: false, type: nengi.Int8 },
            y: { delta: false, type: nengi.Int8 },
            z: { delta: false, type: nengi.Int8 }
        })


        var proxyA = proxify(obj, protocol)

        obj.x += 5
        obj.y += 6
        obj.z -= 5 

        var proxyB = proxify(obj, protocol)

        var changes = formatUpdates(
            config.ID_PROPERTY_NAME,
            proxyA, 
            proxyB,
            protocol
        ) 

        var x = changes.batch.updates[0]
        expect(x.isDelta).toBe(false)
        expect(x.value).toBe(55)

        var y = changes.batch.updates[1]
        expect(y.isDelta).toBe(false)
        expect(y.value).toBe(56)

        var z = changes.batch.updates[2]
        expect(z.isDelta).toBe(false)
        expect(z.value).toBe(45)
    })
})