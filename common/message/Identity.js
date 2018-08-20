const nengi = require('../../nengi')

class Identity {
    constructor(id) {
        this.entityId = id
    }
}

Identity.protocol = {
    entityId: nengi.UInt16
}

module.exports = Identity
