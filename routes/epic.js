var express = require('express');
var router = express.Router();
var epicDao = require('../dao/epic');
var personaDao = require('../dao/persona');
var sanitizer = require('sanitize-html');

router.get('/add', function (req, res, next) {
  personaDao.getNames( function( error , names) {

    res.render("epics/add-epic", {
      personas: names,
    });
  })

});

router.post('/add', function (req, res, next) {
  var title = sanitizer(req.body.title);
  var persona = sanitizer(req.body.persona);
  var description = sanitizer(req.body.description);
  var reason = sanitizer(req.body.reason);
  var acceptance_criteria = sanitizer(req.body.acceptance_criteria);


  epicDao.add( title, persona  , description, reason, acceptance_criteria, function( result , error ) {
      res.redirect('/epics');
  });
});


router.get('/edit/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];

  epicDao.getEpic( storyId, function (error, story) {
    personaDao.getNames(function (error, names) {

      if (error) {
        res.render('damn', {
          message: '┬──┬◡ﾉ(° -°ﾉ)',
          status: error,
          reason: "(╯°□°）╯︵ ┻━┻"
        });

      } else {
        res.render("epics/edit-epic", {
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
  var persona = sanitizer(req.body.persona);
  var description = sanitizer(req.body.description);
  var reason = sanitizer(req.body.reason);
  var acceptance_criteria = sanitizer(req.body.acceptance_criteria);


  epicDao.update( storyId, title, persona , description, reason, acceptance_criteria , function( result , error ) {
    res.redirect('/epic/' + storyId);
  });
});


router.get('/delete/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];

  epicDao.delete( storyId , function(result , error) {
    res.redirect('/epics');
  })
});


router.get('/:storyId', function (req, res, next) {
  var storyId = req.params[ "storyId" ];

  epicDao.getEpic( storyId, function (error, story) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {
      res.render("epics/show-epic", {
        story: story
      });
    }
  })

});



module.exports = router;
