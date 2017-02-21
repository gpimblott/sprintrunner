var express = require('express');
var router = express.Router();
var utils = require('../utils/storyHelper');
var epicDao = require('../dao/epic');

router.get('/', function (req, res, next) {

  epicDao.getAllEpics(function (error, stories) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });

    } else {

      var title = "All Epics";

      res.render('epics/list-epics', {
        title: title,
        stories: stories,
      });
    }
  })

});

module.exports = router;