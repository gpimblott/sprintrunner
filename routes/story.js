var express = require('express');
var router = express.Router();
var storyDao = require('../dao/story');

router.get('/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];

  storyDao.getStory( storyId, function (error, story) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {
      console.log(story);
      res.render("story", {
        story: story
      });
    }
  })

});


module.exports = router;
