var express = require('express');
var router = express.Router();
var utils = require('../utils/storyHelper');
var epicDao = require('../dao/epic');
var personaDao = require('../dao/persona');
var sanitizer = require('sanitize-html');

router.get('/', function (req, res, next) {

  epicDao.getAllEpics(function (error, epics) {

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

router.get('/add', function (req, res, next) {
  personaDao.getNames(function (error, names) {

    res.render("epics/add-epic", {
      personas: names,
    });
  })

});

router.get('/:epicId', function (req, res, next) {
  var epicId = req.params[ "epicId" ];

  epicDao.getEpic(epicId, function (error, epic) {
    personaDao.getNames(function (error, names) {
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
          stories: []
        });
      }
    })
  })

});

router.get('/delete/:epicId', function (req, res, next) {
  var epicId = req.params[ "epicId" ];

  epicDao.delete(epicId, function (result, error) {
    res.redirect('/epics');
  })
});

/**
 * Update methods
 */
router.post('/:epicId', function (req, res, next) {
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

router.post('/', function (req, res, next) {
  var title = sanitizer(req.body.title);
  var persona = sanitizer(req.body.persona);
  var description = sanitizer(req.body.description);
  var reason = sanitizer(req.body.reason);
  var acceptance_criteria = sanitizer(req.body.acceptance_criteria);

  epicDao.add(title, persona, description, reason, acceptance_criteria, function (result, error) {
    res.redirect('/epics');
  });
});

module.exports = router;