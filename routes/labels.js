var express = require('express');
var router = express.Router();
var storyFetcher = require('../lib/storyFetcher');
var pivotalApi = require('../lib/pivotalApi')

router.get('/', function (req, res, next) {

  pivotalApi.getLabelsForProject(res, function (labels) {

    res.render('labels', {
      projectId: res.app.get('pivotalProjectId'),
      defaultLabels: res.app.get('defaultLabels'),
      labels: labels
    });
  })

});

router.get("/:labelName", function (req, res, next) {
  var label = req.params[ "labelName" ];

  storyFetcher.getAllStoriesWithLabel(res, label, res.app.get('defaultProjects'), function (error, stories) {

    if (error) {

      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {
      var total = 0;
      var notEstimated = 0;

      var stateMap = {};

      for (var i = 0; i < stories.length; i++) {
        var story = stories[ i ];

        // Count the stories for each state
        if (story.current_state in stateMap) {
          stateMap[ story.current_state ].count += 1;
          if (typeof story.estimate == "number") {
            stateMap[ story.current_state ].points += story.estimate;
          }
        } else {
          stateMap[ story.current_state ] = { count: 1, points: story.estimate };
        }

        // Could just add all point point up
        if (typeof story.estimate != "number") {
          notEstimated++;
        } else {
          total += story.estimate;
        }
      }


      res.render('stories', {
        title: 'Stories for label: ' + label,
        totalPoints: total,
        notEstimated: notEstimated,
        stories: stories,
        stateMap: stateMap
      });
    }
  });
});

module.exports = router;
