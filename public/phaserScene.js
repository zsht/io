
// start scene
var sceneStart = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function sceneStart ()
        {
            Phaser.Scene.call(this, { key: 'sceneStart' });
        },
    preload: function ()
    {
        this.load.image('start', 'assets/startPic.jpg');
    },
    create: function ()
    {
        this.add.image(400,300,'start')
        this.input.once('pointerdown', function () {
            console.log('i have click the point ')
            this.scene.start('sceneMain');
           // this.scene.switch('sceneMain')
        }, this);
    }
});
module.exports = sceneStart;