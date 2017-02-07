var express = require('express');
var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
var hdf = require('handlebars-dateformat');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var utils = require('./lib/utils.js')

var routes = require('./routes/index');
var labels = require('./routes/labels');
var projects = require('./routes/projects');
var epics = require('./routes/epics');
var stories = require('./routes/stories');
var roadmap = require('./routes/roadmap');
var kanban = require('./routes/kanban');
var search = require('./routes/search');

var projectFetcher = require('./lib/projectFetcher');

var app = express();

/**
 * Set API Key based on Environment variable
 **/
var pivotalApiKey = process.env.PIVOTAL_API_KEY || 'You need to set a key';
app.set('pivotalApiKey', pivotalApiKey);

var pivotalProjectId = process.env.PIVOTAL_PROJECT_ID || 'You need to set a project Id';
app.set('pivotalProjectId', pivotalProjectId);

var reviewSlotsLimit = process.env.REVIEW_SLOTS_LIMIT || 4;
app.set('reviewSlotsLimit', reviewSlotsLimit);

var signOffSlotsLimit = process.env.REVIEW_SLOTS_LIMIT || 5;
app.set('signOffSlotsLimit', signOffSlotsLimit);

var defaultLabels = process.env.DEFAULT_LABELS || "";
app.set('defaultLabels', defaultLabels.split(','));

var defaultProjects = process.env.DEFAULT_PROJECTS || "";
app.set('defaultProjects', defaultProjects.split(','));

var milestoneLabels = process.env.MILESTONE_LABELS || "";
app.set('milestoneLabels', milestoneLabels.split(','));

var hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    dateFormat: hdf,
    nl2br: function (text, isXhtml) {
      var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
      return (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
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
    projectid2name: function (id) {
      return new Handlebars.SafeString(projectFetcher.lookupProject(id));
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
        if (stories[ i ].current_state != 'finished') {
          return options.inverse(this);
        }
      }
      return options.fn(this);
    },
    is_started: function (stories, options) {
      for (var i = 0; i < stories.length; i++) {
        if (stories[ i ].current_state === 'started') {
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
        var story = stories[ i ];
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
});

app.engine('handlebars', hbs.engine);

app.set('view engine', 'handlebars');

var useAuth = process.env.USE_AUTH || 'false'
if (useAuth === 'true') {
  var username = process.env.USERNAME
  var password = process.env.PASSWORD
  app.use(utils.basicAuth(username, password))
}

// view engine setup
app.set('layoutsDir', path.join(__dirname, 'views/layouts'));
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

projectFetcher.buildProjectCache(app.get('pivotalApiKey'), app.get('defaultProjects'));

app.use(function (req, res, next) {
  res.locals.projects = projectFetcher.getProjectSummary();
  res.locals.defaultLabels = app.get('defaultLabels');
  next();
});

app.use('/', routes);
app.use('/labels', labels);
app.use('/projects', projects);
app.use('/epics', epics);
app.use('/stories', stories);
app.use('/roadmap', roadmap);
app.use('/kanban', kanban);
app.use('/search', search);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;