const nengi = require('../../nengi')

class TestMessage {
    constructor(str) {
        this.message = str;
    }
}

TestMessage.protocol = {
    message: nengi.String
}

module.exports = TestMessage
