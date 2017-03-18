'use strict';


var express = require('express');
var security = require('../utils/security');
var router = express.Router();
var teamsDao = require('../dao/teamDao');

router.get('/', security.ensureAuthenticated , function (req, res, next) {

  res.render('teamsummary', {
    projects: teamsDao.getAllTeams()
  });
});

module.exports = router;
