var express = require('express');
var debug = require('debug')('epics-route');
var router = express.Router();
var utils = require('../utils/storyHelper');
var epicDao = require('../dao/epicDao');
var storyDao = require('../dao/storyDao');
var personaDao = require('../dao/personaDao');
var sanitizer = require('sanitize-html');
var sse = require('../routes/sse');

router.get('/', function (req, res, next) {

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

router.get('/add', function (req, res, next) {
  personaDao.getNames(function (error, names) {

    res.render("epics/add-epic", {
      personas: names,
    });
  })

});

router.get('/:epicId', function (req, res, next) {
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

router.get('/delete/:epicId', function (req, res, next) {
  var epicId = req.params[ "epicId" ];

  epicDao.delete(epicId, function (result, error) {
    res.redirect('/epics');
  })
});

/**
 * Update methods
 */
router.post('/:epicId' , function (req, res, next) {
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

// Add a new Epic
router.post('/', function (req, res, next) {
  var title = sanitizer(req.body.title);
  var persona = sanitizer(req.body.persona);
  var description = sanitizer(req.body.description);
  var reason = sanitizer(req.body.reason);
  var acceptance_criteria = sanitizer(req.body.acceptance_criteria);

  epicDao.add(title, persona, description, reason, acceptance_criteria, function (result, error) {
    var data={};
    data.type='epic-add';
    data.icon = req.user.picture;
    data.title = req.user.firstname + " "  + req.user.surname;
    data.message = "New epic added : " + title;

    sse.sendMsgToClients(data);

    res.redirect('/epics');
  });
});

// Update the order of an epic
router.patch('/:from/:to' , function (req, res, next) {
  var from = req.params[ "from" ];
  var to = req.params[ "to" ];
  debug('Moving epic:' + from + ' to ' + to);

  if ( to==null || from == null || from == "null" || to == "null" || from == to) {
    res.sendStatus(200);
    return;
  }

  epicDao.moveEpic(from, to, function (result, error) {
    if (error) {
      res.sendStatus(500);
    } else {

      var data={};
      data.type='epic-move';
      data.icon = req.user.picture;
      data.title = req.user.firstname + " "  + req.user.surname;
      data.from = from;
      data.to = to;
      data.message = "Epics re-ordered please refresh lists";

      sse.sendMsgToClients(data);

      res.sendStatus(200);
    }
  });
});

module.exports = router;