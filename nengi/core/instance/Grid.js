var EDictionary = require('../../external/EDictionary')

function Grid(width, height, cellSize) {
    this.width = width
    this.height = height
    this.cellSize = cellSize
    this.cells = []
    
    this.objects = new EDictionary()
    
    this.init()
}

// used statically from within the pool functions
Grid.pool = []
Grid.instanceCount = 0
Grid.inUseCount = 0
Grid.logStats = function() {
	console.log(
		'GridPool stats', 
		'total', Grid.instanceCount, 
		'avail', Grid.instanceCount - Grid.inUseCount, 
		'in-use', Grid.inUseCount
	)
}

// POOL create or lease instance
Grid.create = function(width, height, cellSize) {
	//return new AABB(x, y, halfWidth, halfHeight)
	var instance

	if (Grid.pool.length === 0) {        
		instance = new Grid(width, height, cellSize)
		Grid.instanceCount++
    } else {
        instance = Grid.pool.pop()
        instance.reinitialize(width, height, cellSize)        
    }

    Grid.inUseCount++
    //Grid.logStats()
	return instance
}

// POOL return instance
Grid.prototype.release = function() {
	Grid.pool.push(this)
	Grid.inUseCount--
}

// POOL clean instance
Grid.prototype.reinitialize = function(width, height, cellSize) {
    this.width = width
    this.height = height
    this.cellSize = cellSize

    // empty out the cells    
    for (var i = 0; i < this.cells.length; i++) {
        // NOTE: for some reason arr.length = 0 produced the lowest gc
        this.cells[i].length = 0        
    }
    
    this.objects = new EDictionary()
}

/*
Grid.create = function(width, height, cellSize) {
    return new Grid(width, height, cellSize)
}
*/

Grid.prototype.init = function() {
    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
            //console.log('init', i, j)
            var index = this.gridPositionToIndex(j, i)
            this.cells[index] = []
        }
    }
}

// added to prototype just for unit testing
// returns an array containing [a,b,c,d] excluding any dupes
Grid.prototype.unique = function(a, b, c, d) {
    var arr = []
    arr.push(a)
    
    if (b !== a) {
        arr.push(b)
    }
    
    if (c !== b && c !== a) {
        arr.push(c)
    }
    
    if (d !== c && d !== b && d !== a) {
        arr.push(d)
    }
    
    return arr
}

Grid.prototype.insert = function(obj) {
    if (this.objects.get(obj.id)) {
        throw new Error('Tried to insert dupe into grid.')
    }
    
    if (typeof obj.halfHeight !== 'undefined' && typeof obj.halfWidth !== 'undefined') {        
        // the indexes of each of the 4 corners
        var index0 = this.xyToIndex(obj.x - obj.halfWidth, obj.y - obj.halfHeight)
        var index1 = this.xyToIndex(obj.x - obj.halfWidth, obj.y + obj.halfHeight)
        var index2 = this.xyToIndex(obj.x + obj.halfWidth, obj.y + obj.halfHeight)
        var index3 = this.xyToIndex(obj.x + obj.halfWidth, obj.y - obj.halfHeight)
        
        var uniqueIndexes = this.unique(index0, index1, index2, index3)
        
        if (uniqueIndexes.length > 1) {
            obj._inMultipleCells = true
            obj._cells = []  
            obj._indexInCells = []
            
            for (var i = 0; i < uniqueIndexes.length; i++) {
                var index = uniqueIndexes[i]
                this.cells[index].push(obj)
                obj._cells.push(index)
                obj._indexInCells.push(this.cells[index].length - 1)
            }
            this.objects.add(obj) 
        } else {
            this._insertIntoSingleCell(obj)
        }        
    } else {
        this._insertIntoSingleCell(obj)
    }
}

Grid.prototype._insertIntoSingleCell = function(obj) {
    var index = this.xyToIndex(obj.x, obj.y)
    this.cells[index].push(obj)
    
    obj._inMultipleCells = false
    obj._cell = index    
    obj._indexInCell = this.cells[index].length - 1
    
    this.objects.add(obj) 
}

Grid.prototype.remove = function(gameObject) {
    if (gameObject._inMultipleCells) {
        for (var i = 0; i < gameObject._cells.length; i++) {
            var cell = this.cells[gameObject._cells[i]]
            var indexInCell = gameObject._indexInCells[i]
            
            cell[indexInCell] = cell[cell.length-1]
            cell[indexInCell]._indexInCell = indexInCell           
            cell.pop()           
        }
        
        gameObject._inMultipleCells = false
        gameObject._cell = -1
        gameObject._indexInCell = -1        
    } else {
        var cell = this.cells[gameObject._cell]
        var indexInCell = gameObject._indexInCell
        
        cell[indexInCell] = cell[cell.length-1]
        cell[indexInCell]._indexInCell = indexInCell
        cell.pop()    
        
        gameObject._cell = -1
        gameObject._indexInCell = -1
    }

    

    this.objects.removeById(gameObject.id)
}

Grid.prototype.xyToGridPosition = function(x, y) {
    return {
        x:  this.toGridScale(x),
        y:  this.toGridScale(y)
    }
}

Grid.prototype.getCellByXY = function(x, y) {
    if (x < 0 || y < 0) {
        return []
    }
    return this.cells[this.gridPositionToIndex(x,y)]
}



Grid.prototype.gridPositionToIndex = function(x, y) {
    return x + this.width * y
}

Grid.prototype.indexToCell = function(index) {
    return {
        x: index % this.width,
        y: Math.floor(index / this.width)
    }
}

Grid.prototype.toGridScale = function(n) {
    if (n < 0) {
         return 0
    } 

   
    return Math.floor(n / this.cellSize)
}

Grid.prototype.xyToIndex = function(x, y) {
    var gridPos = this.xyToGridPosition(x, y)
    return this.gridPositionToIndex(gridPos.x, gridPos.y)
}


Grid.prototype.refresh = function(gameObject) {
    this.remove(gameObject)
    this.insert(gameObject)
}

Grid.prototype.queryArea = function(aabb) {
    var minX = aabb.x - aabb.halfWidth
    var minY = aabb.y - aabb.halfHeight
    var maxX = aabb.x + aabb.halfWidth
    var maxY = aabb.y + aabb.halfHeight    
    //console.log('real', minX, minY, maxX, maxY)
    
    var minGridX = this.toGridScale(minX)
    var minGridY = this.toGridScale(minY)
    var maxGridX = this.toGridScale(maxX)
    var maxGridY = this.toGridScale(maxY)
    //console.log('grid', minGridX, minGridY, maxGridX, maxGridY)
    
    var gridContents = []
    
    for (var gy = minGridY; gy <= maxGridY; gy++) {
        for (var gx = minGridX; gx <= maxGridX; gx++) {
            
            var index = this.gridPositionToIndex(gx, gy)
            //console.log('visit', gx, gy, index)
            var cell = this.cells[index]
            
            for (var i = 0; i < cell.length; i++) {
                gridContents.push(cell[i])
            }
        }
    }
    //console.log('gridContents', gridContents)
    return gridContents    
}

Grid.prototype.raycast = function(x1, y1, x2, y2, maxLength) {
    // grid width
    var dim = this.cellSize
    var lengthSoFar = 0
    
    // direction and magnitude
    var dx = x2 - x1
    var dy = y2 - y1
    
    // direction, normalized
    var rayDir = new Vec2(dx, dy)
    rayDir.normalize() 
    
    // grid coordinates for start of the ray
    var gx = Math.floor(x1 / dim)
    var gy = Math.floor(y1 / dim)
    
    // directionality
    var stepX = (dx > 0) ? 1 : -1
    var stepY = (dy > 0) ? 1 : -1
    
    // distance to next cell
    var tMaxX = 99999
    var tMaxY = 99999
    
    var tDeltaX = 0
    var tDeltaY = 0
    
    if (rayDir.x < 0) {
        tMaxX = (gx * dim - x1) / rayDir.x
        tDeltaX = dim / -rayDir.x
    } else if (rayDir.x > 0) {
        tMaxX = ((gx+1) * dim - x1) / rayDir.x
        tDeltaX = dim / rayDir.x
    }
    
    if (rayDir.y < 0) {
        tMaxY = (gy * dim - y1) / rayDir.y
        tDeltaY = dim / -rayDir.y
    } else if (rayDir.y > 0) {
        tMaxY = ((gy+1) * dim - y1) / rayDir.y
        tDeltaY = dim / rayDir.y
    }

    var i = 0
    // temporarily limit iteration for test purposes
   //var debug = []
    //debug.push(gx)
    //debug.push(gy)
    
    var cache = {}
    var objectsNearRay = []
    while (i < 30) {
        
        //console.log('ray', gx, gy)
        var cell = this.getCellByXY(gx, gy)
        if (cell) {
            for (var j = 0; j < cell.length; j++) {
                // only return items once, even if the ray visits them multiple times
                // as is possible when item is large enough to occupy multiple cells
                if (typeof cache[cell[j].id] === 'undefined'){
                    objectsNearRay.push(cell[j])
                    cache[cell[j].id] = true
                }            
            }
                
            if (tMaxX < tMaxY) {
                tMaxX += tDeltaX
                gx += stepX
            } else {
                tMaxY += tDeltaY
                gy += stepY
            }
        }
    
       i++
    }
    return objectsNearRay
}

module.exports = Grid