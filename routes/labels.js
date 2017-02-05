var express = require('express');
var router = express.Router();
var storyFetcher = require('../lib/storyFetcher');
var pivotalApi = require('../lib/pivotalApi');
var utils = require('../lib/utils');


router.get('/', function (req, res, next) {

  pivotalApi.getLabelsForAllProjects(res, function (labels) {

    res.render('labels', {
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
      utils.renderStories(res, stories, "Stories with label '" + label + "'");
    }
  });
});

module.exports = router;
