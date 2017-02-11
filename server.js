require('dotenv').config({path: 'process.env'});


var debug = require('debug')('sprintrunner:server');
var http = require('http');

var express = require('express');
var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
var hdf = require('handlebars-dateformat');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var utils = require('./lib/utils.js');
var express_enforces_ssl = require('express-enforces-ssl');

var routes = require('./routes/index');
var labels = require('./routes/labels');
var teams = require('./routes/teams');
var epics = require('./routes/epics');
var stories = require('./routes/stories');
var roadmap = require('./routes/roadmap');
var kanban = require('./routes/kanban');
var search = require('./routes/search');
var story = require('./routes/story');

var teamDao = require('./dao/team');

/**
 * Set API Key based on Environment variable
 **/




var SprintRunner = function() {
    var self = this;

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
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating SprintRunner ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
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
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
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
        self.app.engine('handlebars',
            exphbs({
                helpers: {
                    dateFormat: hdf,
                    nl2br: function (text, isXhtml) {
                        var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
                        return (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
                    },
                    encode: function (context, str) {
                        var uri = context || str;
                        return new Handlebars.SafeString(encodeURIComponent(uri));
                    },
                    truncate: function (str, len) {
                        if (str && str.length > len && str.length > 0) {
                            var new_str = str + " ";
                            new_str = str.substr(0, len);
                            new_str = str.substr(0, new_str.lastIndexOf(" "));
                            new_str = (new_str.length > 0) ? new_str : str.substr(0, len);

                            return new Handlebars.SafeString(new_str + '...');
                        }
                        return str;
                    },
                    calculatePoints: function (stories) {
                        var points = 0;
                        if (stories === undefined) {
                            return 0;
                        }

                        stories.forEach(function (story) {
                            if (!(story.estimate === undefined)) {
                                points += story.estimate;
                            }
                        });

                        return points;
                    },
                    is_finished: function (stories, options) {
                        for (var i = 0; i < stories.length; i++) {
                            if (stories[i].current_state != 'finished') {
                                return options.inverse(this);
                            }
                        }
                        return options.fn(this);
                    },
                    is_started: function (stories, options) {
                        for (var i = 0; i < stories.length; i++) {
                            if (stories[i].current_state === 'started') {
                                return options.fn(this);
                            }
                        }
                        return options.inverse(this);
                    },
                    story_summary: function (stories) {
                        var started = 0;
                        var unstarted = 0;
                        var unscheduled = 0;
                        var finished = 0;
                        for (var i = 0; i < stories.length; i++) {
                            var story = stories[i];
                            if (story.current_state === 'started') {
                                started++;
                            } else if (story.current_state === 'finished') {
                                finished++;
                            } else if (story.current_state === 'unstarted') {
                                unstarted++;
                            } else if (story.current_state === 'unscheduled') {
                                unscheduled++;
                            }
                        }

                        var text = "Started: " + started + " Finished:" + finished + " Not Started:" + unstarted + " Unscheduled:" + unscheduled;
                        return text;
                    }
                },
                defaultLayout: 'main'
            }));

        self.app.set('view engine', 'handlebars');

        var defaultLabels = process.env.DEFAULT_LABELS || "";
        self.app.set('defaultLabels', defaultLabels.split(','));

        var defaultProjects = process.env.DEFAULT_PROJECTS || "";
        self.app.set('defaultProjects', defaultProjects.split(','));

        var milestoneLabels = process.env.MILESTONE_LABELS || "";
        self.app.set('milestoneLabels', milestoneLabels.split(','));

        var cookie_key = process.env.COOKIE_KEY || 'aninsecurecookiekey';
        var sess = {
            secret: cookie_key,
            cookie: {}
        }

        if (self.app.get('env') == 'production') {
            self.app.enable('trust proxy', 1); // trusts first proxy - Heroku load balancer
            console.log("In production mode");
            self.app.use(express_enforces_ssl());
            sess.cookie.secure = true;
        }

        self.app.use(session(sess));

        var useAuth = process.env.USE_AUTH || 'false'
        if (useAuth === 'true') {
            var username = process.env.USERNAME
            var password = process.env.PASSWORD
            self.app.use(utils.basicAuth(username, password))
        }

        // view engine setup
        self.app.set('layoutsDir', path.join(__dirname, 'views/layouts'));
        self.app.set('partialsDir' , path.join(__dirname , 'views/partials'));
        self.app.set('views', path.join(__dirname, 'views'));
        self.app.use(express.static(path.join(__dirname, 'public')));

        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({
            extended: false
        }));
        self.app.use(cookieParser());


        // development error handler
        // will print stacktrace
        if (self.app.get('env') === 'development') {
            console.log("In development mode");
            self.app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        self.app.use(function (req, res, next) {
            res.locals.teams = teamDao.getTeamCache();
            res.locals.defaultLabels = self.app.get('defaultLabels');
            next();
        });

        self.app.use('/', routes);
        self.app.use('/labels', labels);
        self.app.use('/teams', teams);
        self.app.use('/epics', epics);
        self.app.use('/stories', stories);
        self.app.use('/roadmap', roadmap);
        self.app.use('/kanban', kanban);
        self.app.use('/search', search);
        self.app.use('/story', story);

        // catch 404 and forward to error handler
        self.app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        teamDao.rebuildCache();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, function () {
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
