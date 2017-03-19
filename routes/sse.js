'use strict'
var debug = require('debug')('sprintrunner:sse');

var openConnections = [];

var SseRoutes = function () {
};

/*****************************************************
 * Server-send API calls
 ******************************************************/
SseRoutes.createRoutes = function (self) {


  // simple route to register the clients
  self.app.get('/stream', function (req, res) {

    // set timeout as high as possible
    req.socket.setTimeout(600 * 60 * 1000);

    // send headers for event-stream connection
    // see spec for more information
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');
    res.flushHeaders();

    // push this res object to our global variable
    openConnections.push(res);
    debug('Add connection : %s open', openConnections.length);
    // When the request is closed, e.g. the browser window
    // is closed. We search through the open connections
    // array and remove this connection.
    req.on("close", function () {
      var toRemove;
      for (var j = 0; j < openConnections.length; j++) {
        if (openConnections[ j ] == res) {
          toRemove = j;
          break;
        }
      }
      openConnections.splice(j, 1);
      debug('Remove connection: %s open', openConnections.length);
    });
  });

}

SseRoutes.sendMsgToClients = function (json) {
  var message = JSON.stringify(json) + '\n\n';
  debug("Sending to %s client(s): %s" , openConnections.length , message );

  openConnections.forEach(function (resp) {
    resp.write('data: '+message); // Note the extra newline
    resp.flush();
  });
}

module.exports = SseRoutes;
