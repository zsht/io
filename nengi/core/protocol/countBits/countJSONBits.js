var utf8 = require('utf8')

function countJSONBits(json) {
    return 32 + (utf8.encode(json).length * 8)
}

module.exports = countJSONBits