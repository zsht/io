const nengi = require('../../nengi')

class Signal {
    constructor(x, y, a) {
        this.x = 0;
        this.y = 0;
        this.REQUIRE_SNAPSHOT = a;
        if(this.REQUIRE_SNAPSHOT === undefined){
            this.REQUIRE_SNAPSHOT = false;
        }
    }
}

Signal.protocol = {
    x: nengi.Float32,
    y: nengi.Float32,
    REQUIRE_SNAPSHOT: nengi.Boolean
}

module.exports = Signal
