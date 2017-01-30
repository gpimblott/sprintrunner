var express = require('express');
var router = express.Router();
var storyFetcher = require('../lib/storyFetcher');
var projectFetcher = require('../lib/projectFetcher');

var internals = {};

internals.renderKanban = function ( res, projects, title ) {
  storyFetcher.getAllStoriesWithStatus(res, 'started', projects, function (error, startedStories) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });
      return;
    }

    storyFetcher.getAllStoriesWithStatus(res, 'finished', projects, function (error, finishedStories) {

      if (error) {
        res.render('damn', {
          message: '┬──┬◡ﾉ(° -°ﾉ)',
          status: error,
          reason: "(╯°□°）╯︵ ┻━┻"
        });

      } else {
        res.render("kanban", {
          started: startedStories,
          finished: finishedStories,
          title: title
        });
      }
    });

  });
}

router.get('/', function (req, res, next) {
  internals.renderKanban( res , res.app.get('defaultProjects') , 'All projects');
});

router.get('/:projectId', function (req, res, next) {
  var projectId = req.params[ "projectId" ];
  internals.renderKanban( res , [ projectId ] , projectFetcher.lookupProject(projectId))
});


module.exports = router;


