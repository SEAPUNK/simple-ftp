'use strict'

// FTP Client class.
//
// Requires to be initialized with a config object,
// containing the following properties:
// - host (String, required) Hostname to connect to.
// - port (Number, default 21) Port to connect to.
// - user (String, default "anonymous") User to authenticate as
// - pass (String, default "@anonymous") Password to authenticate the user with
class FTPClient {
  constructor (config) {
    initFTPClient(this, config)
  }
}

function isEmpty (val) {
  return val === undefined || val === null
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

  // Port validation
  
}

module.exports = FTPClient
