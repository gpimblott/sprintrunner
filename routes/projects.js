var express = require('express');
var router = express.Router();
var projectFetcher = require('../lib/projectFetcher');

router.get('/', function (req, res, next) {

  projectFetcher.getProjectSummary(res, res.app.get('defaultProjects'), function (error, results) {

    if (error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: err,
        reason: "(╯°□°）╯︵ ┻━┻"
      });
    } else {

      res.render('projectsummary', {
        projects: results
      });
    }

  });

});

module.exports = router;
