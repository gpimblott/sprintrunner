'use strict'
var debug = require('debug')('sprintrunner:sse');

var eventQueue = [];
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
    openConnections.push({ userid: req.user.googleid, connection: res });
    debug('Add connection : %s open', openConnections.length);
    // When the request is closed, e.g. the browser window
    // is closed. We search through the open connections
    // array and remove this connection.
    req.on("close", function () {
      var toRemove;
      for (var j = 0; j < openConnections.length; j++) {
        if (openConnections[ j ].connection == res) {
          toRemove = j;
          break;
        }
      }
      openConnections.splice(j, 1);
      debug('Remove connection: %s open', openConnections.length);
    });
  });

}

SseRoutes.getLatestNotifications = function () {
  return eventQueue;
}

SseRoutes.sendMsgToClients = function (userid, json) {
  var message = JSON.stringify(json);
  debug("Sending to %s client(s): %s", openConnections.length, message);

  if (json.type !== 'ping') {
    debug('adding to queue');
    eventQueue.push(json);
    if (eventQueue.length > 5) {
      eventQueue.shift();
    }
  }

  var failedConnections = [];

  for (var j = 0; j < openConnections.length; j++) {
    var conn = openConnections[ j ];
    try {
      // Don't send to the originating user
      if (conn.userid == null || conn.userid != userid) {
        conn.connection.write('data: ' + message + '\n\n'); // Note the extra newline
        conn.connection.flushHeaders();
      }
    } catch (error) {
      failedConnections.push(j);
    }
  }
  ;

  failedConnections.forEach(function (item) {
    debug('Failed %s', item);
  });
}

module.exports = SseRoutes;
