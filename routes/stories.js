'use strict';

var express = require('express');
var utils = require('../utils/storyHelper');
var router = express.Router();
var storyDao = require('../dao/story');
var personaDao = require('../dao/persona');
var sanitizer = require('sanitize-html');

router.get('/', function (req, res, next) {

    storyDao.getAllStories(function (error, stories) {

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

router.get('/status/:status', function (req, res, next) {
    var status = decodeURIComponent(req.params["status"]);

    storyDao.getStoriesWithStatus(status, function (error, stories) {
        if (error) {
            res.render('damn', {
                message: '┬──┬◡ﾉ(° -°ﾉ)',
                status: error,
                reason: "(╯°□°）╯︵ ┻━┻"
            });

        } else {
            utils.renderStories(res, stories, "Stories with status '" + status + "'");
        }
    });

});

router.get('/add', function (req, res, next) {
  personaDao.getNames( function( error , names) {

    res.render("stories/add-story", {
      personas: names,
    });
  })

});

router.get('/edit/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];

  storyDao.getStory( storyId, function (error, story) {
    personaDao.getNames(function (error, names) {

      if (error) {
        res.render('damn', {
          message: '┬──┬◡ﾉ(° -°ﾉ)',
          status: error,
          reason: "(╯°□°）╯︵ ┻━┻"
        });

      } else {
        res.render("stories/edit-story", {
          story: story,
          personas: names
        });
      }
    });
  });

});


router.get('/show/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];

  storyDao.getStory( storyId, function (error, story) {
    console.log(story);
    personaDao.getNames(function (error, names) {
      if (error) {
        res.render('damn', {
          message: 'Something went wrong',
          status: error,
          reason: "Don't know"
        });

      } else {
        res.render("stories/show-story", {
          story: story,
          personas:names
        });
      }
    })
  })
});

/**
 * API tp update stories
 */


router.post('/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];

  console.log("Received update POST for " + storyId);
  var title = sanitizer(req.body.title);
  var status = sanitizer(req.body.status);
  var estimate = sanitizer(req.body.estimate);
  var persona = sanitizer(req.body.persona);
  var description = sanitizer(req.body.description);
  var reason = sanitizer(req.body.reason);
  var acceptance_criteria = sanitizer(req.body.acceptance_criteria);


  storyDao.update( storyId, title, persona , status , description, reason, acceptance_criteria, estimate , function( result , error ) {
    // res.json({success : "Updated Successfully", status : 200});
    // res.end();
    res.redirect('/stories/show/' + storyId);
  });

});


router.post('/', function (req, res, next) {
  var title = sanitizer(req.body.title);
  var status = sanitizer(req.body.status);
  var estimate = sanitizer(req.body.estimate);
  var persona = sanitizer(req.body.persona);
  var description = sanitizer(req.body.description);
  var reason = sanitizer(req.body.reason);
  var acceptance_criteria = sanitizer(req.body.acceptance_criteria);


  storyDao.add( title, persona , status , description, reason, acceptance_criteria, estimate , function( result , error ) {
    res.redirect('/stories');
  });
});

router.delete('/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];

  storyDao.delete( storyId , function(result , error) {
    res.redirect('/stories');
  })
});




module.exports = router;
