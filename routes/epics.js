var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');
var storyDao = require('../dao/story');

router.get('/', function (req, res, next) {

    storyDao.getAllEpics( function (error, stories) {

        if (error) {
            res.render('damn', {
                message: '┬──┬◡ﾉ(° -°ﾉ)',
                status: error,
                reason: "(╯°□°）╯︵ ┻━┻"
            });

        } else {
            utils.renderStories(res, stories, "All Epics");
        }
    })

});

module.exports = router;