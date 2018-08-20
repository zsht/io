const nengi = require('../../nengi')


class PlayerCharacter {
    constructor(x, y) {
        this.x = arguments[0] ? arguments[0] : 0;//设置参数a的默认值为1
        this.y = arguments[1] ? arguments[1] : 0;
        this.active = 1;
        this.visible = 1;
    }
    move(x, y){
        this.x = x;
        this.y = y;
    }
}
PlayerCharacter.protocol = {
    x: nengi.Float32,
    y: nengi.Float32,
    active: nengi.Boolean,
    visible: nengi.Boolean
}
module.exports = PlayerCharacter
