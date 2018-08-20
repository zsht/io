var proxify = require('../../../core/protocol/proxify')
var compare = require('../../../core/protocol/compare')
var nengi = require('../../../')

var chooseOptimization = require('../../../core/snapshot/entityUpdate/chooseOptimization')

xdescribe('chooseOptimization', () => {

    it('chooses batch mode when all changes fit neatly in a batch', () => {

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
        obj.y += 6
        obj.z -= 5  

        var proxyB = proxify(obj, protocol)

        var changes = chooseOptimization('id', proxyA, proxyB, protocol)

        expect(changes.singleProps.length).toEqual(0)
        expect(changes.batch.updates.length).toEqual(3)

        // all changes are batched
        expect(changes.batch.updates[0].prop).toEqual('x')
        expect(changes.batch.updates[0].value).toEqual(5)

        expect(changes.batch.updates[1].prop).toEqual('y')
        expect(changes.batch.updates[1].value).toEqual(6)

        expect(changes.batch.updates[2].prop).toEqual('z')
        expect(changes.batch.updates[2].value).toEqual(-5)
    })


    it('excludes batch mode when a change is too big to be batched', () => {

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

        obj.x += 128 // too big to be batched as an Int8
        obj.y += 6
        obj.z -= 5  

        var proxyB = proxify(obj, protocol)

        var changes = chooseOptimization('id', proxyA, proxyB, protocol)

        expect(changes.singleProps.length).toEqual(3)
        expect(changes.batch.updates.length).toEqual(0)

        // all changes were converted to 'single props' instead of a batch
        expect(changes.singleProps[0].prop).toEqual('x')
        expect(changes.singleProps[0].value).toEqual(50 + 128)

        expect(changes.singleProps[1].prop).toEqual('y')
        expect(changes.singleProps[1].value).toEqual(50 + 6)

        expect(changes.singleProps[2].prop).toEqual('z')
        expect(changes.singleProps[2].value).toEqual(50 - 5)
    })


    it('mixes modes when the batch is valid and other data changes as well', () => {

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
        obj.y += 6
        obj.z -= 5 
        obj.hitpoints -= 25 // a change outside of the batch

        var proxyB = proxify(obj, protocol)

        var changes = chooseOptimization('id', proxyA, proxyB, protocol)

        expect(changes.singleProps.length).toEqual(1)
        expect(changes.batch.updates.length).toEqual(3)

        // the batch is complete
        expect(changes.batch.updates[0].prop).toEqual('x')
        expect(changes.batch.updates[0].value).toEqual(5)

        expect(changes.batch.updates[1].prop).toEqual('y')
        expect(changes.batch.updates[1].value).toEqual(6)

        expect(changes.batch.updates[2].prop).toEqual('z')
        expect(changes.batch.updates[2].value).toEqual(-5)

        // as is a single property of hitpoints
        expect(changes.singleProps[0].prop).toEqual('hitpoints')
        expect(changes.singleProps[0].value).toEqual(100 - 25)
    })

    it('works with non-delta changes', () => {

        var protocol = new nengi.EntityProtocol({
            x: nengi.UInt16,
            y: nengi.UInt16,
            z: nengi.UInt16,
            hitpoints: nengi.UInt8
        }, {
            // optimizations
            x: { delta: false, type: nengi.Int8 },
            y: { delta: false, type: nengi.Int8 },
            z: { delta: false, type: nengi.Int8 }
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

        var changes = chooseOptimization('id', proxyA, proxyB, protocol)

        expect(changes.singleProps.length).toEqual(0)
        expect(changes.batch.updates.length).toEqual(3)

        // all changes are batched NO delta this time
        expect(changes.batch.updates[0].prop).toEqual('x')
        expect(changes.batch.updates[0].value).toEqual(50 + 5)

        expect(changes.batch.updates[1].prop).toEqual('y')
        expect(changes.batch.updates[1].value).toEqual(50 + 6)

        expect(changes.batch.updates[2].prop).toEqual('z')
        expect(changes.batch.updates[2].value).toEqual(50 - 5)
    })

    it('works with non-delta changes and floats', () => {

        var protocol = new nengi.EntityProtocol({
            x: nengi.Float32,
            y: nengi.Float32,
            z: nengi.Float32,
            hitpoints: nengi.UInt8
        }, {
            // optimizations
            x: { delta: false, type: nengi.Float32 },
            y: { delta: true, type: nengi.Float32},
            z: { delta: false, type: nengi.Float32 }
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

        obj.x += Math.PI
        obj.y += Math.PI * 2
        obj.z -= Math.PI

        var proxyB = proxify(obj, protocol)

        var changes = chooseOptimization('id', proxyA, proxyB, protocol)

        expect(changes.singleProps.length).toEqual(0)
        expect(changes.batch.updates.length).toEqual(3)

        // non-delta
        expect(changes.batch.updates[0].prop).toEqual('x')
        expect(changes.batch.updates[0].value).toEqual(50 + Math.PI)

        // delta
        expect(changes.batch.updates[1].prop).toEqual('y')
        expect(changes.batch.updates[1].value).toEqual(Math.PI * 2)

        // non-delta
        expect(changes.batch.updates[2].prop).toEqual('z')
        expect(changes.batch.updates[2].value).toEqual(50 - Math.PI)
    })

    
})