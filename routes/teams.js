'use strict';


var express = require('express');
var router = express.Router();
var teamsDao = require('../dao/teamDao');

router.get('/' , function (req, res, next) {

  res.render('teamsummary', {
    projects: teamsDao.getAllTeams()
  });
});

module.exports = router;
