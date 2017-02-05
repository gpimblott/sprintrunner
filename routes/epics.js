var express = require('express');
var router = express.Router();
var epicFetcher = require('../lib/epicFetcher');

router.get('/', function (req, res, next) {

  epicFetcher.getAllEpics(res, res.app.get('defaultProjects'), function (error, epics) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });
    } else {

      res.render('epicsummary', {
        epics: epics
      });

    }
  });

});

module.exports = router;