var express = require('express');
var router = express.Router();
var storyFetcher = require('../lib/storyFetcher');
var utils = require('../lib/utils');
var storyDao = require('../dao/story');

router.get('/', function (req, res, next) {

    storyDao.getAllStories(function (error, stories) {

        if (error) {
            res.render('damn', {
                message: '┬──┬◡ﾉ(° -°ﾉ)',
                status: error,
                reason: "(╯°□°）╯︵ ┻━┻"
            });

        } else {
            utils.renderStories(res, stories, "All Stories");
        }
    })

});

router.get('/:status', function (req, res, next) {
    var status = decodeURIComponent(req.params["status"]);

    storyDao.getStoriesWithStatus(status, function (error, stories) {
        if (error) {
            res.render('damn', {
                message: '┬──┬◡ﾉ(° -°ﾉ)',
                status: error,
                reason: "(╯°□°）╯︵ ┻━┻"
            });

        } else {
            utils.renderStories(res, stories, "Stories with status '" + status + "'");
        }
    });

});

module.exports = router;
