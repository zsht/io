
var batchOrSingleProps = require('../../../core/snapshot/entityUpdate/batchOrSingleProps')
var proxify = require('../../../core/protocol/proxify')

var nengi = require('../../../')

xdescribe('batchOrSingleProps ', () => {

    it ('batches when valid', () => {

        var protocol = new nengi.EntityProtocol({
            x: nengi.UInt16,
            y: nengi.UInt16,
            z: nengi.UInt16,
            hitpoints: nengi.UInt8
        }, {
            // optimizations
            x: { delta: true, type: nengi.Int8 },
            y: { delta: true, type: nengi.Int8 },
            z: { delta: true, type: nengi.Int8 }
        })

        var obj = {
            id: 0,
            type: 0,
            x: 50,
            y: 50,
            z: 50,
            hitpoints: 100
        }

        var proxyA = proxify(obj, protocol)

        obj.x += 5
        obj.y += 0 // not a change, but still should be included
        obj.z -= 5  

        var proxyB = proxify(obj, protocol)

        var changes = batchOrSingleProps(
            proxyA, 
            proxyB,
            protocol
        )

        expect(changes.singlePropUpdates.length).toBe(0)
        expect(changes.batchedUpdates.length).toBe(3)
        expect(changes.batchedUpdates).toEqual(['x', 'y', 'z'])
    })


    it ('single prop when batch is invalid', () => {

        var protocol = new nengi.EntityProtocol({
            x: nengi.UInt16,
            y: nengi.UInt16,
            z: nengi.UInt16,
            hitpoints: nengi.UInt8
        }, {
            // optimizations
            x: { delta: true, type: nengi.Int8 },
            y: { delta: true, type: nengi.Int8 },
            z: { delta: true, type: nengi.Int8 }
        })

        var obj = {
            id: 0,
            type: 0,
            x: 50,
            y: 50,
            z: 50,
            hitpoints: 100
        }

        var proxyA = proxify(obj, protocol)

        obj.x += 999
        obj.y += 6
        obj.z -= 5  

        var proxyB = proxify(obj, protocol)

        var changes = batchOrSingleProps(
            proxyA, 
            proxyB,
            protocol
        )

        expect(changes.singlePropUpdates.length).toBe(3)
        expect(changes.singlePropUpdates).toEqual(['x', 'y', 'z'])
        expect(changes.batchedUpdates.length).toBe(0)
    })

    it ('single props when no batch in protocol', () => {

        var protocol = new nengi.EntityProtocol({
            x: nengi.UInt16,
            y: nengi.UInt16,
            z: nengi.UInt16,
            hitpoints: nengi.UInt8
        })

        var obj = {
            id: 0,
            type: 0,
            x: 50,
            y: 50,
            z: 50,
            hitpoints: 100
        }

        var proxyA = proxify(obj, protocol)

        obj.x += 5
        obj.y += 6
        obj.z -= 5  

        var proxyB = proxify(obj, protocol)

        var changes = batchOrSingleProps(
            proxyA, 
            proxyB,
            protocol
        )

        expect(changes.singlePropUpdates.length).toBe(3)
        expect(changes.singlePropUpdates).toEqual(['x', 'y', 'z'])
        expect(changes.batchedUpdates.length).toBe(0)
    })
})