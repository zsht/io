function compareNumbers(a, b) {
    return a - b
}

function compareArrays(a, b) {
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
	return { aOnly: left, both: both, bOnly: right }
}

module.exports = compareArrays