var express = require('express');
var router = express.Router();
var storyFetcher = require('../lib/storyFetcher');

var internals = {};

internals.renderStories = function (res, stories, title) {
  var total = 0;
  var notEstimated = 0;

  var stateMap = {};

  for (var i = 0; i < stories.length; i++) {
    var story = stories[ i ];

    // Count the stories for each state
    if (story.current_state in stateMap) {
      stateMap[ story.current_state ].count += 1;
      if (typeof story.estimate !== 'undefined' && typeof story.estimate === "number") {
        stateMap[ story.current_state ].points += story.estimate;
        console.log("etimate yy:" + story.estimate + ":");
        console.log("total yy:" + story.estimate + ":");
      }
    } else {
      if (typeof story.estimate === 'undefined') {
        stateMap[ story.current_state ] = { count: 1, points: 0 };
      } else {
        stateMap[ story.current_state ] = { count: 1, points: story.estimate };
      }
    }

    // Could just add all point point up
    if (typeof story.estimate === "undefined" || typeof story.estimate !== "number") {
      notEstimated++;
    } else {
      total += story.estimate;
    }
  }

  res.render('stories', {
    title: title,
    stories: stories,
    totalPoints: total,
    notEstimated: notEstimated,
    stateMap: stateMap
  });
}

router.get('/', function (req, res, next) {

  storyFetcher.getAllStories(res, res.app.get('defaultProjects'), function (error, stories) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {
      internals.renderStories(res, stories, "All Stories");
    }
  })

});

router.get('/:status', function (req, res, next) {
  var status = req.params[ "status" ];

  storyFetcher.getAllStoriesWithStatus(res, status , res.app.get('defaultProjects'), function (error, stories) {
    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {
      internals.renderStories(res, stories, "Stories with Status " + status);
    }
  });

});

module.exports = router;
