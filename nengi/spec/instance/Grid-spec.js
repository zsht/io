var Grid = require('../../core/instance/Grid')

function benchmark(name, fn, iterations) {
    if (typeof process !== 'undefined') {
        var time = process.hrtime()
        for (var i = 0; i < iterations; i++) {
            fn()
        }
        var diff = process.hrtime(time)
        var ms = ((diff[0] * 1e9 + diff[1])/1000000)
        console.log(name, ms, 'ms')
    } else {
        var start = Date.now()
        for (var i = 0; i < iterations; i++) {
            fn()
        }
        var stop = Date.now()
        console.log(name, stop - start, 'ms')
    }
}

describe('Grid', function() {
    var grid = null
    
    beforeEach(function() {
        grid = new Grid(10, 10, 10)
    })


    benchmark('yo', function() {
        var g = new Grid(200, 200, 48)
    }, 1)



    



    it('can insert an item', function() {
        var gameObject = { id: 1, x: 5, y: 5 }
        grid.insert(gameObject)
        // expect the first item of the first cell to be our game object
        expect(grid.cells[0][0]).toBe(gameObject)
    })
    
    it('can remove an item', function() {
        var gameObject = { id: 1, x: 5, y: 5 }
        grid.insert(gameObject)
        //console.log(grid.cells)
        grid.remove(gameObject)
        //console.log(grid.cells)
        // expect the first item of the first cell to be our game object
        expect(grid.cells[0].length).toEqual(0)
    })
    
    it('can remove a wide item', function() {
        // this item is wide enough to spill into adjacent cells
        var gameObject = { id: 1, x: 6, y: 6, halfHeight: 5, halfWidth: 5 }
        grid.insert(gameObject)
        //console.log(grid.cells)
        grid.remove(gameObject)
        //console.log(grid.cells)
        // expect the first item of the first cell to be our game object
        expect(grid.cells[0].length).toEqual(0)
    })
    
    
    it('can detect game objects via raycasts', function() {
        var gameObjectA = { id: 1, x: 11, y: 11 }
        grid.insert(gameObjectA)
        
        var gameObjectB = { id: 2, x: 33, y: 33 }
        grid.insert(gameObjectB)
        
        var nearbyObjects = grid.raycast(0, 0, 100, 100, 99999)
        
        expect(nearbyObjects[0]).toBe(gameObjectA)
        expect(nearbyObjects[1]).toBe(gameObjectB)
    })
    
    
    it('can detect game objects that spill into other cells via raycasts', function() {
        var gameObjectA = { id: 1, x: 11, y: 11, halfHeight: 5, halfWidth: 5 }
        grid.insert(gameObjectA)        
        
        // this ray will miss the cell that has the center of gameObjectA
        // but this ray will touch a cell that gameObjectA overlaps into
        var nearbyObjects = grid.raycast(0, 0, 0, 100, 99999)
        expect(nearbyObjects[0]).toBe(gameObjectA)
        
        // technically it will have encountered gameObjectA twice, but it should
        // only return one object total // should this be another test?
        expect(nearbyObjects.length).toBe(1)
    })
    
    
    it('unique', function() {
        var res = grid.unique(1,1,2,1)
        expect(res).toEqual([1, 2])
    })
})