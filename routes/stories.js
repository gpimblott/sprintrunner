var express = require('express');
var router = express.Router();
var storyFetcher = require('../lib/storyFetcher');
var utils = require('../lib/utils');

router.get('/', function (req, res, next) {

  storyFetcher.getAllStories(res, res.app.get('defaultProjects'), function (error, stories) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {
      utils.renderStories(res, stories, "All Stories");
    }
  })

});

router.get('/:status', function (req, res, next) {
  var status = req.params[ "status" ];

  storyFetcher.getAllStoriesWithStatus(res, status, res.app.get('defaultProjects'), function (error, stories) {
    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {
      utils.renderStories(res, stories, "Stories with status '" + status+"'");
    }
  });

});

module.exports = router;
