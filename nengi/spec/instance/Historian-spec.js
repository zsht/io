var Historian = require('../../core/instance/Historian')
function benchmark(name, fn, iterations) {
	if (typeof process !== 'undefined') {
		var time = process.hrtime()
		for (var i = 0; i < iterations; i++) {
			fn()
		}
		var diff = process.hrtime(time)
		var ms = ((diff[0] * 1e9 + diff[1])/1000000)
		console.log(name + ' x' + iterations, ms, 'ms')
	} else {
		var start = Date.now()
		for (var i = 0; i < iterations; i++) {
			fn()
		}
		var stop = Date.now()
		console.log(name + ' x' + iterations, stop - start, 'ms')
	}
}

describe('Historian', function() {

	it('maintains a positional history for entities', function() {
		var historian = new Historian()

		var view = { x: 50, y: 50, halfWidth: 30, halfHeight: 30 }

		var entity = {
			id: 1,
			x: 50,
			y: 50
		}

		var entities = []
		entities.push(entity)

		// NOTE: historian.record is invoked by instance.update every tick
		// this test manually simulates 4 frames of history as an entity moves

		historian.record(0, entities, [], null)

		entity.x += 5
		historian.record(1, entities, [], null)

		entity.x += 5
		historian.record(2, entities, [], null)

		entity.x += 5
		historian.record(3, entities, [], null)

		// CURRENT entity is now at x: 65, y: 50
		expect(entity.x).toBe(65)

		// Checking history...
		// get history from tick 0
		var snapshot0 = historian.getSnapshot(0)
		var positions0 = snapshot0.queryArea(view).entities
		// expect entity at x: 50
		expect(positions0[0].x).toBe(50)

		// get history from tick 1
		var snapshot1 = historian.getSnapshot(1)
		var positions1 = snapshot1.queryArea(view).entities
		// expect entity at x: 55
		expect(positions1[0].x).toBe(55)

		// get history from tick 2
		var snapshot2 = historian.getSnapshot(2)
		var positions2 = snapshot2.queryArea(view).entities
		// expect entity at x: 60
		expect(positions2[0].x).toBe(60)

		// get history from tick 3
		var snapshot3 = historian.getSnapshot(3)
		var positions3 = snapshot3.queryArea(view).entities
		// expect entity at x: 65
		expect(positions3[0].x).toBe(65)

		
	})

	it ('client benchmark', function() {
		function getRandomIntInclusive(min, max) {
			min = Math.ceil(min)
			max = Math.floor(max)
			return Math.floor(Math.random() * (max - min + 1)) + min
		}

		function randomArrayOfUniqueIntegers(length, min, max) {
			var arr = []
			for (var i = 0; i < length; i++) {
				var insertedNewEntry = false
				while (!insertedNewEntry) {
					var entry = getRandomIntInclusive(min, max)
					if (arr.indexOf(entry) === -1) {
						arr.push(entry)
						insertedNewEntry = true
					}
				}
			}
			return arr

		}

		function compareNumbers(a, b) {
		    return a - b
		}

		function arrayDiffs(a, b) {
			a.sort(compareNumbers)
			b.sort(compareNumbers)

			var left = []
			var both = []
			var right = []

			var i = 0
			var j = 0

			while (i < a.length && j < b.length) {
			    if (a[i] < b[j]) {
		        	left.push(a[i])
			        ++i
			    } else if (b[j] < a[i]) {
			        right.push(b[j])
			        ++j
			    } else {
			        both.push(a[i])
			        ++i
			        ++j
			    }
			}
			while (i < a.length) {
			   left.push(a[i])
			    ++i
			}
			while (j < b.length) {
			    right.push(b[j])
			    ++j
			}
		    // left: ids that were in A only
		    // both: ids that were in both A and B
		    // right: ids that were in B only
			return { left: left, both: both, right: right }
		}

		function arrCompare(a, b) {
			var aOnly = []
			var both = []
			var bOnly = []

			var aLength = a.length
			var bLength = b.length
			var length = (aLength >= bLength) ? aLength : bLength
			for (var i = 0; i < length; i++) {
				var valueA = a[i]
				var valueB = b[i]

				if (i < aLength) {
					if (b.indexOf(valueA) === -1) {
						aOnly.push(valueA)
					} else {
						both.push(valueA)
					}
				}

				if (i < bLength) {
					if (a.indexOf(valueB) === -1) {
						bOnly.push(valueB)
					}
				}
		
				
			}
			return { left: aOnly, both: both, right: bOnly}
		}


		//var a = randomArrayOfUniqueIntegers(2000, 0, 2500)
		//var b = randomArrayOfUniqueIntegers(2000, 0, 2500)

		//var result0 //= arrayDiffs(a, b)
		//var result1 //= arrCompare(a, b)

		

	
		/*
		benchmark('arrayDiffs', function() {
			result0 = arrayDiffs(a, b)
		}, 10)

			benchmark('arrCompare', function() {
			result1 = arrCompare(a, b)
		}, 10)
		*/
		
		//expect(result0).toEqual(result1)

		//console.log(result)












	})
})