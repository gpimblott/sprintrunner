var express = require('express');
var router = express.Router();
var storyFetcher = require('../lib/storyFetcher');

router.get('/', function (req, res, next) {
  storyFetcher.getStoriesWithLabel(res, 'mvp nov17', res.app.get('defaultProjects'), function (error, stories) {

    if (error) {

      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {
      res.render("roadmap", {
        data: [
          { title: 'mvp nov17', stories: stories },
          { title: 'mvp april 18', stories: stories }
          ]
      });
    }

  });
});

module.exports = router;


