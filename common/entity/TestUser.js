const nengi = require('../../nengi')

// testUser的属性 是 我们使用的对象需要传给服务器的。
class TestUser {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.id = -1;
        this.active = 1;
        this.visible = 1;
        this.isDestroy = 0;
        this.anim = 4;
        this.kill = 0;
    }



}

TestUser.protocol = {
    x: nengi.Float32,
    y: nengi.Float32,
    id: nengi.UInt16,
    active: nengi.Boolean,
    visible: nengi.Boolean,
    isDestroy: nengi.Boolean,
    anim: nengi.UInt16,
    kill: nengi.UInt16
}

module.exports = TestUser
