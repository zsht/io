const nengi = require('../../nengi')

class TestLocalMessage {
    constructor(str) {
        this.message = str;
    }
}

TestLocalMessage.protocol = {
    message: nengi.String
}

module.exports = TestLocalMessage
