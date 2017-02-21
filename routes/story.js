var express = require('express');
var router = express.Router();
var storyDao = require('../dao/story');
var personaDao = require('../dao/persona');
var sanitizer = require('sanitize-html');

router.get('/add', function (req, res, next) {
  personaDao.getNames( function( error , names) {

    res.render("stories/add-story", {
      personas: names,
    });
  })

});

router.post('/add', function (req, res, next) {
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

router.post('/update/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];
  var title = sanitizer(req.body.title);
  var status = sanitizer(req.body.status);
  var estimate = sanitizer(req.body.estimate);
  var persona = sanitizer(req.body.persona);
  var description = sanitizer(req.body.description);
  var reason = sanitizer(req.body.reason);
  var acceptance_criteria = sanitizer(req.body.acceptance_criteria);


  storyDao.update( storyId, title, persona , status , description, reason, acceptance_criteria, estimate , function( result , error ) {
    res.redirect('/story/' + storyId);
  });
});


router.get('/delete/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];

  storyDao.delete( storyId , function(result , error) {
    res.redirect('/stories');
  })
});

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
      res.render("stories/show-story", {
        story: story
      });
    }
  })

});



module.exports = router;
