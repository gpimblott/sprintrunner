var express = require('express');
var router = express.Router();
var projectFetcher = require('../lib/projectFetcher');

router.get('/', function (req, res, next) {

  var results = projectFetcher.getProjectSummary();

  res.render('projectsummary', {
      projects: results
    });
});

module.exports = router;
