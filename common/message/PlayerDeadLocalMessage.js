const nengi = require('../../nengi')

class PlayerDeadLocalMessage {
    constructor(x,y,id, killedId) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.killedId = killedId;
    }
}

PlayerDeadLocalMessage.protocol = {
    x: nengi.UInt16,
    y: nengi.UInt16,
    id: nengi.UInt16,
    killedId: nengi.UInt16
}

module.exports = PlayerDeadLocalMessage
