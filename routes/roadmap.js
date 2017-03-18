var express = require('express');
var security = require('../utils/security');
var router = express.Router();
var async = require('async');


var internals = {};


/**
 * Routes
 */
router.get('/', security.ensureAuthenticated , function (req, res, next) {

    res.render("roadmap", {
        milestones: []
    });


});

module.exports = router;


