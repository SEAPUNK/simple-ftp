'use strict'

// TODO: socket.setTimeout: When is this useful? Do we need this?
// TODO: Throw an error on functions that require active connections
//       when the connection has not yet established.

const net = require('net')
const debug = require('debug')('simple-ftp:client')
const guaranteedError = require('guaranteed-error')
const {isEmpty} = require('./util')

const DEFAULT_FTP_PORT = 21
const DEFAULT_FTP_USER = 'anonymous'
const DEFAULT_FTP_PASS = '@anonymous'

// FTP Client class.
//
// This is a disposable connection: If the connection is stopped, or initial
// connection fails, then the client can no longer be usable again; you will
// need to create a new instance.
//
// Requires to be initialized with a config object,
// containing the following properties:
// - host (String, required) Hostname to connect to.
// - port (Number, default 21) Port to connect to.
// - user (String, default "anonymous") User to authenticate as
// - pass (String, default "@anonymous") Password to authenticate the user with
class FTPClient {
  constructor (config) {
    debug('Initializing new FTP client')
    initFTPClient(this, config)
  }
}

// Initializes the FTP client instance.
//
// Note that no connection is made until Client.connect() is called.
function initFTPClient (instance, config) {
  if (!config) throw new Error('No config provided')

  let {host, port, user, pass} = config

  // Host validation
  if (isEmpty(host)) throw new Error('No host specified')
  if (typeof host !== 'string') throw new Error('Host must be a string')
  instance.host = host
  debug('[host] given %s, using %s', host, instance.host)

  // Port validation
  if (isEmpty(port)) port = DEFAULT_FTP_PORT
  if (typeof port !== 'number') throw new Error('Port must be a number')
  instance.port = port
  debug('[port] given %s, using %s', port, instance.port)

  // User validation
  if (isEmpty(user)) user = DEFAULT_FTP_USER
  if (typeof user !== 'string') throw new Error('User must be a string')
  instance.user = user
  debug('[user] given %s, using %s', user, instance.user)

  // Password validation
  if (isEmpty(pass)) pass = DEFAULT_FTP_PASS
  if (typeof pass !== 'string') throw new Error('Pass must be a string')
  instance.pass = pass
  debug('[pass] is given: %s; using given: %s', !!pass, instance.pass === pass)

  // This is a "lifetime" Promise, letting the user keep track of
  // the client's aliveness.
  //
  // This is practically used in Promise.race; for example,
  // ```js
  // const client = createClient({host: 'localhost'})
  // Promise.race([
  //   doThingWithClient(client),
  //   client.finish
  // ])
  // ```
  //
  // This Promise
  // - resolves with nothing when the connection has been shut down cleanly
  // - rejects if an error occured, and the client had to abruptly shut down
  instance.finish = new Promise((resolve, reject) => {
    instance._finishResolve = (arg) => {
      instance._finished = true
      delete instance._finishResolve
      delete instance._finishReject
      resolve(arg)
    }
    instance._finishReject = (err) => {
      instance._finished = true
      delete instance._finishResolve
      delete instance._finishReject
      reject(err)
    }
  })
  // An internal state tracker, that keeps track of pretty much the same thing.
  instance._finished = false
}

// Establishes the FTP connection.
//
// Returns a promise that
// - resolves when the connection is ready for commands.
// - rejects whenever anything fails, may it be authentication,
//   or connection issues.
function connect () {
  return new Promise((resolve, reject) => {
    if (this.socket) return reject(new Error('connect() has already been called'))

    // We will control the returned Promise outside of this function.
    // TODO: Clean this up when done.
    this._connectResolve = resolve
    this._connectReject = reject

    // Create the socket, attach event listeners, and establish a connection.
    // TODO: Initialize socket timeout
    const socket = new net.Socket({ allowHalfOpen: false })
    this.socket = socket

    socket.on('connect', this._handleSocketConnect.bind(this))
    socket.on('data', this._handleSocketData.bind(this))
    socket.on('close', this._handleSocketClose.bind(this))
    socket.on('error', this._handleSocketError.bind(this))

    debug('Connecting socket')
    // Connect to the socket.
    socket.connect({
      port: this.port,
      host: this.host
    })
  })
}
FTPClient.prototype.connect = connect

// Handles socket connection.
// This must be called only ONCE (tracked with _socketConnected).
// This will let us start the connection.
function _handleSocketConnect () {
  debug('Socket connect')
  if (this._socketConnected) {
    return this._panic(new Error('Socket connect handler called multiple times!'))
  }
  if (this._socketErrored || this._socketClosed) {
    return this._panic(new Error('Socket connect handler called after close or error!'))
  }
  // TODO: Reset socket timeout
  this._socketConnected = true
}
FTPClient.prototype._handleSocketConnect = _handleSocketConnect


// Internal method, used to shut EVERYTHING down as cleanly as possible.
// Something really bad has happened, and we should not continue.
//
// This method is only called:
// - AFTER a socket is created and attached, so we can clean up the socket
function _panic (_err) {
  const err = guaranteedError(_err)
  debug('PANIC (_finished: %s)\n%s', this._finished, err.stack)

  // Do not do anything if the client is already finished.
  if (this._finished) return

  // First, "finish" the client, so the user stops
  // whatever they are doing with the client.
  this._finishReject(err)

  // Now, we can do cleanup tasks in the background, to make sure
  // the client doesn't do anything stupid.
  // TODO

  // Purge the socket. Don't bother to cleanly close it.
  this.socket.removeAllListeners()
  this.socket.destroy()
  this.socket.unref()
}
FTPClient.prototype._panic = _panic

module.exports = FTPClient
