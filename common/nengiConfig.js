const nengi = require('../nengi')

var nengiConfig = {
    // UPDATE_RATE of server logic, used by interp calculations
    UPDATE_RATE: 20,
    // DRAW_RATE is not currently used
    DRAW_RATE: 60,
    // range of ids, e.g. 0-65535, increase this if you can have more than 65535 objects at the same time
    ID_BINARY_TYPE: nengi.UInt16,
    // range of types, e.g. 0-255, increase this if you have more than 255 protocol definitions
    TYPE_BINARY_TYPE: nengi.UInt8,

    /* UNTESTED at anything other than the default values of 'id', 'parentId', and 'type' */
    // property name that stores the id on nengi objects
    ID_PROPERTY_NAME: 'id',
    // property name that stores the parent on components (if used)
    PARENT_ID_PROPERTY_NAME: 'parentId',
    // property name that stores the type on nengi objects
    TYPE_PROPERTY_NAME: 'type',

    protocols: {
        // example of using components
        /*
        entities: [
            { protocol: entityProtocol, type: 255, components: { mode: 'Map' } },
        ],

        components: Object.keys(ComponentIndex)
            .filter(key => ComponentIndex[key].hasOwnProperty('protocol'))
            .map(key => ({protocol: ComponentIndex[key].protocol, type: Component[key.toUpperCase()]})),
        */

        entities: [
            ['TestUser', require('./entity/TestUser')]
        ],
        //components: [],
        localMessages: [
            ['Signal', require('./message/Signal')],
            ['PlayerDeadLocalMessage', require('./message/PlayerDeadLocalMessage')]
        ],
        messages: [
            ['Identity', require('./message/Identity')],
            ['TestMessage', require('./message/TestMessage')],
            ['TestLocalMessage', require('./message/TestLocalMessage')],
        ],
        commands: [
            ['TestCommand', require('./command/TestCommand')],
            ['MoveCommand', require('./command/MoveCommand')],
            ['PlayerDeadCommand', require('./command/PlayerDeadCommand')]
        ],
        basics: []
    }
}


module.exports = nengiConfig
