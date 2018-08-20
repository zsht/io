var ProtocolMap = require('../../core/protocol/ProtocolMap')

describe('ProtocolMap', () => {
    it('offers lookup by protocol and lookup by index', ()=> {
        var foo = {}
        var bar = {}
        var baz = {}

        var protocolMap = new ProtocolMap({
            protocolA: foo,
            protocolB: bar,
            protocolC: baz
        })

        expect(protocolMap.getIndex(foo)).toEqual(0)
        expect(protocolMap.getIndex(bar)).toEqual(1)
        expect(protocolMap.getIndex(baz)).toEqual(2)

        expect(protocolMap.getProtocol(0)).toBe(foo)
        expect(protocolMap.getProtocol(1)).toBe(bar)
        expect(protocolMap.getProtocol(2)).toBe(baz)

        expect(foo.name).toEqual('protocolA')
        expect(bar.name).toEqual('protocolB')
        expect(baz.name).toEqual('protocolC')
    })
})