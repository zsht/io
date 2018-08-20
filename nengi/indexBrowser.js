/**
* Please see the NENGI END USER LICENSE available in the LICENSE.txt file
* By downloading or using this software or related content you are agreeing to 
* be bounds by the terms of the NENGI END USER LICENSE Agreement. If you do not 
* or cannot agree to the terms of the Agreement please do not download or use 
* this software.
*/
var nengi = {}
//nengi.config = require('./config')

var BinaryType = require('./core/binary/BinaryType')
// shortcuts for less typing
nengi.Boolean   = BinaryType.Boolean
nengi.Int2      = BinaryType.Int2
nengi.UInt2     = BinaryType.UInt2
nengi.Int3      = BinaryType.Int3
nengi.UInt3     = BinaryType.UInt3
nengi.Int4      = BinaryType.Int4
nengi.UInt4     = BinaryType.UInt4
nengi.Int6      = BinaryType.Int6
nengi.UInt6     = BinaryType.UInt6
nengi.Int8      = BinaryType.Int8
nengi.UInt8     = BinaryType.UInt8
nengi.Int10     = BinaryType.Int10
nengi.UInt10    = BinaryType.UInt10
nengi.Int12     = BinaryType.Int12
nengi.UInt12    = BinaryType.UInt12
nengi.Int16     = BinaryType.Int16
nengi.UInt16    = BinaryType.UInt16
nengi.Int32     = BinaryType.Int32
nengi.UInt32    = BinaryType.UInt32
nengi.Float32   = BinaryType.Float32
nengi.Number = 
nengi.Float64   = BinaryType.Float64
nengi.EntityId  = BinaryType.EntityId
nengi.RGB888    = BinaryType.RGB888
//nengi.Rotation8 = BinaryType.Rotation8
nengi.ASCIIString    = BinaryType.ASCIIString
nengi.String =
nengi.UTF8String = BinaryType.UTF8String

nengi.Basic =
nengi.Protocol = require('./core/protocol/Protocol')

nengi.Entity =
nengi.EntityProtocol = require('./core/protocol/EntityProtocol')

nengi.LEvent =
nengi.LocalEventProtocol = require('./core/protocol/LocalEventProtocol')

nengi.Msg =
nengi.Message =
nengi.MessageProtocol = require('./core/protocol/MessageProtocol')

nengi.Command =
nengi.CommandProtocol = require('./core/protocol/CommandProtocol')


// NODE-only
//nengi.Instance = require('./core/instance/Instance')

// browser
nengi.Client = require('./core/client/Client')
nengi.Interpolator = require('./core/client/Interpolator')

// NODE-only
//engi.Bot = require('./core/bot/Bot')

module.exports = nengi
