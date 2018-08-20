var B = require('../binary/BinaryType')

class NoInterpsMessage {
    constructor(ids) {
        this.type = 66
        this.ids = ids
    }
}

NoInterpsMessage.protocol = {
    ids: { type: B.UInt32, indexType: B.UInt32  }
}

module.exports = NoInterpsMessage
