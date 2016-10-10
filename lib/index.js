'use strict'

// A single FTP connection, with a single data channel.
// Good for most uses.
exports.Client = require('./Client')

// Manages many clients, used for transferring data over multiple
// connections at a time, similar to how FileZilla does it.
exports.ClientCluster = require('./ClientCluster')
