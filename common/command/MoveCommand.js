const nengi = require('../../nengi')

class MoveCommand {
    constructor(x, y, anim,kill) {
        this.x = x;
        this.y = y;
        this.anim = anim;
        this.kill = kill;
    }
}
MoveCommand.protocol = {
    x: nengi.Float32,
    y: nengi.Float32,
    anim: nengi.UInt16,
    kill: nengi.UInt16
}
module.exports = MoveCommand
