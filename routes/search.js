var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');


router.get('/', function (req, res, next) {
    var queryStr = req.query.query;
    console.log(queryStr);

    utils.renderStories(res, [], "Search results for '" + queryStr + "'");
});

module.exports = router;
