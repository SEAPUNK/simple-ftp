// This just keeps track of the class's instance variables and methods.
// For personal use.
//
// FTPClient
// - host
// - port
// - user
// - pass
//
// - finish (Promise)
// - _finishResolve (disposable, finish Promise control)
// - _finishReject (disposable, finish Promise control)
// - _finished (internal control,
//              lets client know if client should stop,
//              prevents Promise control)
//
// - socket (net.Socket)
// - _socketConnected (handler control)
// - _socketErrored (handler control)
// - _socketClosed (handler control)
// - _connectResolve (disposable, connect() returned Promise control)
// - _connectReject (disposable, connect() returned Promise control)
// - _connected (internal control, prevents Promise control)
//
// FTPClient methods
// - connect() - establishes connection. Called only once.
// - _panic() - forcibly aborts everything.
// - _handleSocketConnect
// - _handleSocketData
// - _handleSocketClose
// - _handleSocketError
