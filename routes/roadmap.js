'use strict';

var express = require('express');
var router = express.Router();
var async = require('async');


var internals = {};


/**
 * Routes
 */
router.get('/', function (req, res, next) {

    res.render("roadmap", {
        milestones: []
    });


});

module.exports = router;


