var express = require('express');
var security = require('../utils/security');
var router = express.Router();
var utils = require('../utils/storyHelper');
var epicDao = require('../dao/epicDao');
var storyDao = require('../dao/storyDao');
var personaDao = require('../dao/personaDao');
var sanitizer = require('sanitize-html');

router.get('/', security.ensureAuthenticated , function (req, res, next) {

  epicDao.getAllEpics(function (epics, error) {

    if (error) {
      res.render('damn', {
        message: 'Something went wrong',
        status: error,
        reason: "Don't know why"
      });

    } else {

      var title = "All Epics";

      res.render('epics/list-epics', {
        title: title,
        epics: epics,
      });
    }
  })

});

router.get('/add', security.ensureAuthenticated, function (req, res, next) {
  personaDao.getNames(function (error, names) {

    res.render("epics/add-epic", {
      personas: names,
    });
  })

});

router.get('/:epicId', security.ensureAuthenticated, function (req, res, next) {
  var epicId = req.params[ "epicId" ];

  epicDao.getEpic(epicId, function (epic, error) {
    personaDao.getNames(function (error, names) {
      storyDao.getStoriesForEpic(epicId, function (error, stories) {

        if (error) {
          res.render('damn', {
            message: 'Something went wrong',
            status: error,
            reason: "Don't know why"
          });

        } else {
          res.render("epics/show-epic", {
            epic: epic,
            personas: names,
            stories: stories
          });
        }
      })
    })
  })

});

router.get('/delete/:epicId', security.ensureAuthenticated, function (req, res, next) {
  var epicId = req.params[ "epicId" ];

  epicDao.delete(epicId, function (result, error) {
    res.redirect('/epics');
  })
});

/**
 * Update methods
 */
router.post('/:epicId', security.ensureAuthenticated , function (req, res, next) {
  var epicId = req.params[ "epicId" ];
  var title = sanitizer(req.body.title);
  var persona = sanitizer(req.body.persona);
  var description = sanitizer(req.body.description);
  var reason = sanitizer(req.body.reason);
  var acceptance_criteria = sanitizer(req.body.acceptance_criteria);

  epicDao.update(epicId, title, persona, description, reason, acceptance_criteria, function (result, error) {
    res.redirect('/epics/' + epicId);
  });
});

router.post('/', security.ensureAuthenticated , function (req, res, next) {
  var title = sanitizer(req.body.title);
  var persona = sanitizer(req.body.persona);
  var description = sanitizer(req.body.description);
  var reason = sanitizer(req.body.reason);
  var acceptance_criteria = sanitizer(req.body.acceptance_criteria);

  epicDao.add(title, persona, description, reason, acceptance_criteria, function (result, error) {
    res.redirect('/epics');
  });
});

router.patch('/:from/:to', security.ensureAuthenticated , function (req, res, next) {
  var from = req.params[ "from" ];
  var to = req.params[ "to" ];
  console.log('Moving:' + from + ' to ' + to);

  if ( to==null || from == null || from == "null" || to == "null" || from == to) {
    res.sendStatus(200);
    return;
  }

  epicDao.moveEpic(from, to, function (result, error) {
    if (error) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

module.exports = router;