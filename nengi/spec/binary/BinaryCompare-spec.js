
describe('float compare', () => {
    it('Float64', ()=> {
        var a = Math.PI + 1
        var b = Math.PI + 1
        expect(a).toEqual(b)
    })

    it('Float32', ()=> {
        var a = Math.PI + 1
        var b = Math.PI + 1
        expect(Math.fround(a)).toEqual(Math.fround(b))
    })
})

