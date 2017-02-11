var express = require('express');
var router = express.Router();
var teamsDao = require('../dao/team');

router.get('/', function (req, res, next) {

    teamsDao.getAllTeams(function (error, results) {

        res.render('teamsummary', {
            projects: results
        });
    });
});

module.exports = router;
