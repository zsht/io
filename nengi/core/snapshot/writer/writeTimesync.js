var Chunk = require('../Chunk').Chunk
var BinaryType = require('../../binary/BinaryType')
var Binary = require('../../binary/Binary')

function writeTimesync(bitStream, time, avgLatency) {
    //console.log('invoked', time)
    if (time > -1) {
        bitStream.writeUInt8(Chunk.Timesync)
        bitStream.writeFloat64(time)
        //console.log('writing latency', avgLatency)
        bitStream.writeUInt9(avgLatency)
    }
}

module.exports = writeTimesync