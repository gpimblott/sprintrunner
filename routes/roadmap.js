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
      results.push({ epic: epic, stories: labelMap[ epic.label.name ].stories });
    }
  }

  callback(null, results);
}

internals.getEpicsForMilestones = function (res, epics, name, callback) {
  // Now get the labels we are interested in
  storyFetcher.getAllStoriesWithLabel(res, name, res.app.get('defaultProjects'), function (error, stories) {
    if (error) {
      callback(error, null);
    } else {
      internals.getEpics(stories, epics, callback);
    }
  });
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

      var milestoneNames = res.app.get('milestoneLabels');
      var functionArray = [];
      for (var i = 0; i < milestoneNames.length; i++) {
        functionArray.push(internals.getEpicsForMilestones.bind(null, res, epics, milestoneNames[ i ]));
      }

      async.parallel(
        functionArray,

        function (err, results) {
          if (err) {
            res.render('damn', {
              message: '┬──┬◡ﾉ(° -°ﾉ)',
              status: err,
              reason: "(╯°□°）╯︵ ┻━┻"
            });
          } else {

            var resultsArray = [];
            for (var i = 0; i < milestoneNames.length; i++) {
              resultsArray.push({ title: milestoneNames[ i ] , data: results[ i ]});
            }
            res.render("roadmap", {
              milestones: resultsArray
            });
          }
        });
    }
  });
});

module.exports = router;


