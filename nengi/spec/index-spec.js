


describe('foo', function() {

	var test = require('../test')('booo')


	var test2 = require('../test')()
	console.log('test2', test2)
	console.log('TEST', test === test2)
})