var express = require('express');
var router = express.Router();
var projectFetcher = require('../lib/projectFetcher');


router.get('/', function (req, res, next) {

  projectFetcher.getProjectSummary(res,  res.app.get('defaultProjects').split(','));

});

module.exports = router;
