var express = require('express');
var router = express.Router();
var storyFetcher = require('../lib/storyFetcher');

router.get('/:projectId/:storyId', function (req, res, next) {
  var projectId = req.params[ "projectId" ];
  var storyId = req.params[ "storyId" ];

  storyFetcher.getStory(res, projectId , storyId, function (error, story) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {
      res.render("story", {
        story: story
      });
    }
  })

});


module.exports = router;
