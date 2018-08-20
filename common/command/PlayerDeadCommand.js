const nengi = require('../../nengi')


// who kill who
class PlayerDeadCommand {
    constructor(id,killedId) {
        this.id = id;
        this.killedId = killedId;
    }
}
PlayerDeadCommand.protocol = {
    id: nengi.UInt16,
    killedId: nengi.UInt16
}
module.exports = PlayerDeadCommand
