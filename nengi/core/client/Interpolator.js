const EntityCache = require('../instance/EntityCache')
const getValue = require('../protocol/getValue')
const Binary = require('../binary/Binary')

const findInitialSnapshot = function (snapshots, renderTime) {
    for (var i = snapshots.length - 1; i >= 0; i--) {
        var snapshot = snapshots[i]
        if (snapshot.timestamp < renderTime) {
            return { snapshot: snapshot, index: i }
        }
    }
}

const lerp = function (a, b, portion) {
    return a + ((b - a) * portion)
}

class Interpolator {
    constructor(interpDelay) {
        this.cache = new EntityCache()
        this.interpDelay = interpDelay
        this.lastProcessedTick = -1
    }

    interpolate(snapshots, tickLength, avgDiff) {
        var renderTime = Date.now() - this.interpDelay - avgDiff

        var late = []

        var snapshotOlderIndex = null
        var snapshotNewer = null
        var snapshotOlder = null

        var initialSnapshotData = findInitialSnapshot(snapshots, renderTime)

        if (initialSnapshotData) {
            snapshotOlder = initialSnapshotData.snapshot
            snapshotOlderIndex = initialSnapshotData.index
        }

        if (snapshotOlder) {
            var olderTick = snapshotOlder.tick
            for (var i = 0; i < snapshots.length; i++) {
                var tempSnapshot = snapshots[i]
                if (tempSnapshot.tick === olderTick + 1) {
                    snapshotNewer = tempSnapshot
                }
            }

            var iSnapshot = {
                createEntities: [],
                deleteEntities: [],
                updateEntities: [],
                createComponents: [],
                deleteComponents: [],
                updateComponents: [],
                tick: null
            }

            if (snapshotOlder.tick - 1 > this.lastProcessedTick) {
                for (var i = snapshots.length - 1; i > -1; i--) {
                    var ss = snapshots[i]
                    if (ss.tick < snapshotOlder.tick && !ss.processed) {
                        late.push(ss)
                        ss.processed = true
                        snapshots.splice(i, 1)
                    }
                }
            }

            late.reverse()

            if (!snapshotOlder.processed) {
                iSnapshot.timestamp = snapshotOlder.timestamp
                iSnapshot.createEntities = iSnapshot.createEntities.concat(snapshotOlder.createEntities)
                iSnapshot.deleteEntities = iSnapshot.deleteEntities.concat(snapshotOlder.deleteEntities)
                iSnapshot.createComponents = iSnapshot.createComponents.concat(snapshotOlder.createComponents)
                iSnapshot.deleteComponents = iSnapshot.deleteComponents.concat(snapshotOlder.deleteComponents)
                iSnapshot.updateEntities = iSnapshot.updateEntities.concat(snapshotOlder.updateEntities)
                snapshotOlder.processed = true
                iSnapshot.tick = snapshotOlder.tick
                this.lastProcessedTick = snapshotOlder.tick

                for (var i = 0; i < iSnapshot.createEntities.length; i++) {
                    this.cache.saveEntity(iSnapshot.createEntities[i], iSnapshot.createEntities[i].protocol)
                }

                for (var i = 0; i < iSnapshot.deleteEntities.length; i++) {
                    this.cache.deleteEntity(iSnapshot.deleteEntities[i])
                }

                for (var i = 0; i < iSnapshot.createComponents.length; i++) {
                    this.cache.saveEntity(iSnapshot.createComponents[i], iSnapshot.createComponents[i].protocol)
                }

                for (var i = 0; i < iSnapshot.updateEntities.length; i++) {
                    this.cache.updateEntityPartial(
                        iSnapshot.updateEntities[i].id,
                        iSnapshot.updateEntities[i].path,
                        iSnapshot.updateEntities[i].value
                    )
                }
            }
        }

        if (snapshotNewer && snapshotOlder) {
            if (snapshotOlder.tick >= this.lastProcessedTick) {
                var total = tickLength
                var portion = renderTime - snapshotOlder.timestamp
                var ratio = portion / total

                iSnapshot.timestamp = lerp(snapshotOlder.timestamp, snapshotNewer.timestamp, ratio)

                var ids = []

                for (var i = 0; i < snapshotNewer.updateEntities.length; i++) {
                    var update = snapshotNewer.updateEntities[i]
                    ids.push(update.id)

                    var prop = update.prop
                    var entityOlder = snapshotOlder.entities.get(update.id)
                    var propData = entityOlder.protocol.properties[prop]
                    var binaryType = Binary[propData.type]

                    if (propData.interp && snapshotNewer.noInterps.indexOf(update.id) === -1) {
                        var entityNewer = snapshotNewer.entities.get(update.id)
                        var valueOlder = getValue(entityOlder, propData.path)
                        var valueNewer = getValue(entityNewer, propData.path)

                        var valueInterp = valueOlder

                        if (typeof binaryType.interp === 'function') {
                            valueInterp = binaryType.interp(valueOlder, valueNewer, ratio)
                        } else {
                            valueInterp = lerp(valueOlder, valueNewer, ratio)
                        }

                        if (valueInterp !== getValue(this.cache.getEntity(update.id), propData.path)) {
                            iSnapshot.updateEntities.push({
                                id: update.id,
                                prop: prop,
                                path: propData.path,
                                value: valueInterp
                            })
                        }
                    } else {
                        if (update.value !== getValue(this.cache.getEntity(update.id), update.path)) {
                            iSnapshot.updateEntities.push(update)
                        }
                    }
                }

                for (var i = 0; i < snapshotOlder.updateEntities.length; i++) {
                    var update = snapshotOlder.updateEntities[i]

                    if (ids.indexOf(update.id) === -1) {
                        if (update.value !== getValue(this.cache.getEntity(update.id), update.path)) {
                            iSnapshot.updateEntities.push(update)
                        }
                    }
                }

                ids = []

                for (var i = 0; i < snapshotNewer.updateComponents.length; i++) {
                    var update = snapshotNewer.updateComponents[i]
                    ids.push(update.id)
                    var entityOlder = snapshotOlder.components.get(update.id)
                    var prop = update.prop
                    var propData = entityOlder.protocol.properties[prop]

                    var binaryType = Binary[propData.type]

                    if (propData.interp && snapshotNewer.noInterps.indexOf(update.id) === -1) {
                        var entityNewer = snapshotNewer.components.get(update.id)
                        var valueOlder = getValue(entityOlder, propData.path)
                        var valueNewer = getValue(entityNewer, propData.path)

                        var valueInterp = valueOlder

                        if (typeof binaryType.interp === 'function') {
                            valueInterp = binaryType.interp(valueOlder, valueNewer, ratio)
                        } else {
                            valueInterp = lerp(valueOlder, valueNewer, ratio)
                        }

                        if (valueInterp !== getValue(this.cache.getEntity(update.id), propData.path)) {
                            iSnapshot.updateComponents.push({
                                id: update.id,
                                prop: prop,
                                path: propData.path,
                                value: valueInterp
                            })
                        }
                    } else {
                        if (update.value !== getValue(this.cache.getEntity(update.id), update.path)) {
                            iSnapshot.updateComponents.push(update)
                        }
                    }
                }

                for (var i = 0; i < snapshotOlder.updateComponents.length; i++) {
                    var update = snapshotOlder.updateComponents[i]

                    if (ids.indexOf(update.id) === -1) {
                        if (update.value !== getValue(this.cache.getEntity(update.id), update.path)) {
                            iSnapshot.updateComponents.push(update)
                        }
                    }
                }
            }
        } else {
            // extrapolate?
        }

        if (iSnapshot) {
            for (var i = 0; i < iSnapshot.updateEntities.length; i++) {
                this.cache.updateEntityPartial(
                    iSnapshot.updateEntities[i].id,
                    iSnapshot.updateEntities[i].path,
                    iSnapshot.updateEntities[i].value
                )
            }
            for (var i = 0; i < iSnapshot.updateComponents.length; i++) {
                this.cache.updateEntityPartial(
                    iSnapshot.updateComponents[i].id,
                    iSnapshot.updateComponents[i].path,
                    iSnapshot.updateComponents[i].value
                )
            }
            for (var i = 0; i < iSnapshot.deleteComponents.length; i++) {
                this.cache.deleteEntity(iSnapshot.deleteComponents[i])
            }
        }

        // add the interpolated snapshot to the end of all of the late snapshots
        if (iSnapshot) {
            late.push(iSnapshot)
        }        
        
        return {
            entities: late,
            interpA: snapshotOlder,
            interpB: snapshotNewer
        }        
    }
}

module.exports = Interpolator