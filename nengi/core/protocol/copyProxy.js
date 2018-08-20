var proxify = require('./proxify')

function copyProxy(proxy, schema) {
    return proxify(proxy, schema)
}

module.exports = copyProxy