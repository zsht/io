var isBatchAtomiclyValid = require('../../../core/snapshot/entityUpdate/isBatchAtomiclyValid')
var proxify = require('../../../core/protocol/proxify')
var compare = require('../../../core/protocol/compare')
var nengi = require('../../../')


describe('isBatchAtomiclyValid', () => {
    var protocol, obj

    beforeEach(() => {
        protocol = new nengi.EntityProtocol({
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

        obj = {
            id: 0,
            type: 0,
            x: 50,
            y: 50,
            z: 50,
            hitpoints: 100
        }
    })

    it('valid for changes within binary type bounds', () => {
        var proxyA = proxify(obj, protocol)

        obj.x += 5
        obj.y += 6
        obj.z -= 5  

        var proxyB = proxify(obj, protocol)

        var diffs = compare(proxyA, proxyB, protocol)

        expect(isBatchAtomiclyValid(diffs, protocol)).toBe(true)
    })

    it('invalid for changes that exceed binary type bounds', () => {
        var proxyA = proxify(obj, protocol)

        obj.x += 128 // 128 is too big for Int8
        obj.y += 6
        obj.z -= 5  

        var proxyB = proxify(obj, protocol)

        var diffs = compare(proxyA, proxyB, protocol)

        expect(isBatchAtomiclyValid(diffs, protocol)).toBe(false)
    })

    it('invalid for no changes', () => {
        var proxyA = proxify(obj, protocol)

        obj.x += 0
        obj.y += 0
        obj.z -= 0  

        var proxyB = proxify(obj, protocol)

        var diffs = compare(proxyA, proxyB, protocol)

        expect(isBatchAtomiclyValid(diffs, protocol)).toBe(false)
    })

    it('valid for a single change', () => {
        var proxyA = proxify(obj, protocol)

        obj.x += 0
        obj.y += 5
        obj.z -= 0  

        var proxyB = proxify(obj, protocol)

        var diffs = compare(proxyA, proxyB, protocol)

        expect(isBatchAtomiclyValid(diffs, protocol)).toBe(true)
    })
})
