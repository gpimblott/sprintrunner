'use strict';

require('dotenv').config({ path: 'process.env' });

const passport = require('passport');
require('./config/passport');

const logger = require('./winstonLogger')(module);

const express = require('express');
const exphbs = require('express-handlebars');
const hdf = require('handlebars-dateformat');
require('./utils/handlerbarsHelpers');

const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const setupRoutes = require('./routes/setupRoutes');

const teamDao = require('./dao/teamDao');
const statusDao = require('./dao/statusDao');

const serverSideEvents = require('./routes/sse');

const helmet = require('helmet');

logger.info("Starting SprintRunner");

logger.stream = {
  write: function(message, encoding){
    logger.verbose(message);
  }
};

/**
 * Set API Key based on Environment variable
 **/
const SprintRunner = function () {
  const self = this;

  /**
   *  Set up server IP address and port # using env variables/defaults.
   */
  self.setupVariables = function () {
    //  Set the environment variables we need.
    self.port = process.env.PORT || 8090;
  };

  /**
   *  terminator === the termination handler
   *  Terminate server on receipt of the specified signal.
   *  @param {string} sig  Signal to terminate on.
   */
  self.terminator = function (sig) {
    if (typeof sig === 'string') {
      logger.info('%s: Received %s - terminating SprintRunner ...',
        Date(Date.now()), sig);
      process.exit(1);
    }
    logger.info('%s: Node server stopped.', Date(Date.now()));
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
    self.app.use(morgan('tiny'));
    self.app.use(helmet());

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
    logger.info('GA ID: %s', self.app.locals.google_id);

    const defaultLabels = process.env.DEFAULT_LABELS || '';
    self.app.set('defaultLabels', defaultLabels.split(','));
    logger.info('Default labels : %s', defaultLabels);

    const milestoneLabels = process.env.MILESTONE_LABELS || '';
    self.app.set('milestoneLabels', milestoneLabels.split(','));
    logger.info('Milestone labels : %s' , milestoneLabels);

    const cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
    const sess = {
      secret: cookie_key,
      cookie: {}
    }

    if (self.app.get('env') == 'production') {
      self.app.enable('trust proxy', 1); // trusts first proxy - Heroku load balancer
      logger.info('In production mode');
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
      logger.info('In development mode');
      self.app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
          message: err.message,
          error: err
        });
      });
    }

    // Notifications are just a queue so we can keep the reference
    self.app.locals.eventQueue = serverSideEvents.getLatestNotifications();
    self.app.locals.defaultLabels = self.app.get('defaultLabels');

    self.app.use(function (req, res, next) {
      res.locals.teams = teamDao.getAllTeams();
      res.locals.status = statusDao.getStatusCache();
      if (req.user) {
        res.locals.profile = req.user;
      }

      next();
    });


    // Setup the Server-side events
    setupRoutes.setup( self );

    self.app.use(function (req, res, next) {
      // the status option, or res.statusCode = 404
      // are equivalent, however with the option we
      // get the 'status' local available as well
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
const sprintRunnerApp = new SprintRunner();
sprintRunnerApp.initialize();
sprintRunnerApp.start();
