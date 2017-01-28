var express = require('express');
var router = express.Router();
var epicFetcher = require('../lib/epicFetcher');


router.get('/', function (req, res, next) {

  epicFetcher.getEpicSummary(res,  res.app.get('defaultProjects').split(','));

});

module.exports = router;