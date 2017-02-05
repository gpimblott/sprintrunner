var express = require('express');
var router = express.Router();
var async = require('async');

var storyFetcher = require('../lib/storyFetcher');
var epicFetcher = require('../lib/epicFetcher');

var internals = {};

internals.getEpics = function (stories, epics, callback) {
  var labelMap = {};
  var results = [];

  for (var i = 0; i < stories.length; i++) {
    var story = stories[ i ];

    for (var j = 0; j < story.labels.length; j++) {
      var storyLabel = story.labels[ j ].name;

      if (!(storyLabel in labelMap)) {
        labelMap[ storyLabel ] = { stories: [ story ], epic: undefined };
      } else {
        labelMap[ storyLabel ].stories.push(story);
      }
    }
  }

  for (var j = 0; j < epics.length; j++) {
    var epic = epics[ j ];

    if (epic.label.name in labelMap) {
      results.push({epic:epic, stories:labelMap[epic.label.name].stories});
    }
  }

  callback(null, results);
}

/**
 * Routes
 */
router.get('/', function (req, res, next) {

  // Get all the Epics first
  epicFetcher.getAllEpics(res, res.app.get('defaultProjects'), function (error, epics) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {

      async.parallel([
          function (callback) {
            // Now get the labels we are interested in
            storyFetcher.getAllStoriesWithLabel(res, "mvp nov17", res.app.get('defaultProjects'), function (error, stories) {
              if (error) {
                callback(error, null);
              } else {
                internals.getEpics(stories, epics, callback);
              }
            });
          },
          function (callback) {
            // Now get the labels we are interested in
            storyFetcher.getAllStoriesWithLabel(res, "mvp april 18", res.app.get('defaultProjects'), function (error, stories) {
              if (error) {
                callback(error, null);
              } else {
                internals.getEpics(stories, epics, callback);
              }
            });
          },
          function (callback) {
            // Now get the labels we are interested in
            storyFetcher.getAllStoriesWithLabel(res, "post april 18", res.app.get('defaultProjects'), function (error, stories) {
              if (error) {
                callback(error, null);
              } else {
                internals.getEpics(stories, epics, callback);
              }
            });
          } ],
        // Combine the results of the things above
        function (err, results) {
          if (err) {
            res.render('damn', {
              message: '┬──┬◡ﾉ(° -°ﾉ)',
              status: err,
              reason: "(╯°□°）╯︵ ┻━┻"
            });
          } else {

            res.render("roadmap", {
              milestones: [
                { title: 'MVP Nov 17', data: results[ 0 ] },
                { title: 'MVP April 18', data: results[ 1 ] },
                { title: 'Post April 18', data: results[ 2 ] }
              ]
            });
          }
        });
    }
  });
});

module.exports = router;


