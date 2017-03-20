'use strict';

require('dotenv').config({ path: 'process.env' });

var passport = require('passport');
require('./config/passport');

var debug = require('debug')('sprintrunner:server');
var http = require('http');

var express = require('express');
var sse = require('./routes/sse');

var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
var hdf = require('handlebars-dateformat');
require('./utils/handlerbarsHelpers');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');

var setupRoutes = require('./routes/setupRoutes');

var teamDao = require('./dao/teamDao');
var statusDao = require('./dao/statusDao');

var sseRoutes = require('./routes/sse');


/**
 * Set API Key based on Environment variable
 **/
var SprintRunner = function () {
  var self = this;

  /**
   *  Set up server IP address and port # using env variables/defaults.
   */
  self.setupVariables = function () {
    //  Set the environment variables we need.
    self.port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT  || 8090;
    self.server_ip_address = process.env.OPENSHIFT_NODEJS_IP;
  };

  /**
   *  terminator === the termination handler
   *  Terminate server on receipt of the specified signal.
   *  @param {string} sig  Signal to terminate on.
   */
  self.terminator = function (sig) {
    if (typeof sig === "string") {
      debug('%s: Received %s - terminating SprintRunner ...',
        Date(Date.now()), sig);
      process.exit(1);
    }
    debug('%s: Node server stopped.', Date(Date.now()));
  };

  /**
   *  Setup termination handlers (for exit and a list of signals).
   */
  self.setupTerminationHandlers = function () {
    //  Process on exit and signals.
    process.on('exit', function () {
      self.terminator();
    });

    // Removed 'SIGPIPE' from the list - bugz 852598.
    [ 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
      'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function (element, index, array) {
      process.on(element, function () {
        self.terminator(element);
      });
    });
  };

  /**
   *  Initialize the server (express) and create the routes and register
   *  the handlers.
   */
  self.initialize = function () {


    self.setupVariables();
    self.setupTerminationHandlers();

    // Setup Express
    self.app = express();
    self.app.engine('hbs',
      exphbs({
        helpers: {
          dateFormat: hdf
        },
        defaultLayout: 'main',
        extname: '.hbs'
      }));

    self.app.set('view engine', 'hbs');

    // Setup the Google Analytics ID if defined
    self.app.locals.google_id = process.env.GOOGLE_ID || undefined;
    debug("GA ID: %s", self.app.locals.google_id);

    var defaultLabels = process.env.DEFAULT_LABELS || "";
    self.app.set('defaultLabels', defaultLabels.split(','));
    debug('Default labels : %s' , defaultLabels);

    var milestoneLabels = process.env.MILESTONE_LABELS || "";
    self.app.set('milestoneLabels', milestoneLabels.split(','));
    debug('Milestone labels : %s' , milestoneLabels);

    var cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
    var sess = {
      secret: cookie_key,
      cookie: {}
    }

    if (self.app.get('env') == 'production') {
      self.app.enable('trust proxy', 1); // trusts first proxy - Heroku load balancer
      console.log("In production mode");
      sess.cookie.secure = true;
    }

    // Definition of static resources needs to be before
    // Passport initialisation otherwise Passport
    // will be called for every static resource
    self.app.use(express.static(path.join(__dirname, 'public')));

    // Now initialise the session and passport
    self.app.use(session(sess));
    self.app.use(passport.initialize());
    self.app.use(passport.session());

    // Load the cache values
    statusDao.rebuildCache();
    teamDao.rebuildCache();

    // view engine setup
    self.app.set('layoutsDir', path.join(__dirname, 'views/layouts'));
    self.app.set('partialsDir', path.join(__dirname, 'views/partials'));
    self.app.set('views', path.join(__dirname, 'views'));

    self.app.use(bodyParser.json());
    self.app.use(bodyParser.urlencoded({
      extended: false
    }));
    self.app.use(cookieParser());

    // development error handler
    // will print stacktrace
    if (self.app.get('env') === 'development') {
      debug("In development mode");
      self.app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      });
    }

    // Notifications are just a queue so we can keep the reference
    self.app.locals.eventQueue = sseRoutes.getLatestNotifications();
    self.app.locals.defaultLabels = self.app.get('defaultLabels');

    self.app.use(function (req, res, next) {
      res.locals.teams = teamDao.getAllTeams();
      res.locals.status = statusDao.getStatusCache();
      if (req.user) {
        res.locals.profile = req.user;
      }

      next();
    });


    // Setup all the routes
    setupRoutes.createRoutes( self );


    // On certain hosts the SSE connections need to be kept alive

    if( process.env.SSE_KEEP_ALIVE || false ) {
      var CronJob = require('cron').CronJob;
      new CronJob('*/10 * * * * *', function () {
        debug('sending ping');
        var message = {};
        message.ping=true;
        sse.sendMsgToClients(message);
      }, null, true, 'America/Los_Angeles');
    }


    self.app.use(function (req, res, next) {
      // the status option, or res.statusCode = 404
      // are equivalent, however with the option we
      // get the "status" local available as well
      res.render('404', { status: 404, url: req.url });
    });

  };

  /**
   *  Start the server (starts up the sample application).
   */
  self.start = function () {
    //  Start the app on the specific interface (and port).
    self.app.listen(self.port, self.server_ip_address, function () {
      console.log('%s: Node server started on %s:%d ...',
        Date(Date.now()), self.port);
    });
  };
}

/**
 *  main():  Main code.
 */
var sprintRunnerApp = new SprintRunner();
sprintRunnerApp.initialize();
sprintRunnerApp.start();
