const nengi = require('../../nengi')

class TestSendCommand {
    constructor(str) {
        this.message = str;
    }
}
TestSendCommand.protocol = {
    message: nengi.String
}
module.exports = TestSendCommand
