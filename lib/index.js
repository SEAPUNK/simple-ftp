'use strict'

const minico = require('minico')

// A single FTP connection, with a single data channel.
// Good for most uses.
const Client = require('./Client')

// Manages many clients, used for transferring data over multiple
// connections at a time, similar to how FileZilla does it.
const ClientCluster = require('./ClientCluster')

// Creates a client, and connects to the server, returning the ready client.
// Returns a Promise that:
// - resolves with the ready client
// - rejects with any error encountered.
const createClient = minico(function * createClient (config) {
  const client = new Client(config)
  yield client.connect()
  return client
})

exports.Client = Client
exports.ClientCluster = ClientCluster
exports.createClient = createClient
