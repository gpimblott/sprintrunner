var express = require('express');
var security = require('../utils/security');
var router = express.Router();
var labelDao = require('../dao/labelDao');
var storyDao = require('../dao/storyDao');
var utils = require('../utils/storyHelper');


router.get('/', security.ensureAuthenticated , function (req, res, next) {

    labelDao.getAllLabels(function (error, labels) {

        res.render('labels', {
            defaultLabels: res.app.get('defaultLabels'),
            labels: labels
        });
    })

});

router.get("/:labelName", security.ensureAuthenticated , function (req, res, next) {
    var label = decodeURIComponent(req.params["labelName"]);

    storyDao.getStoriesWithLabel(label, function (error, stories) {

        console.log( stories);
        if (error) {
            res.render('damn', {
                message: '┬──┬◡ﾉ(° -°ﾉ)',
                status: error,
                reason: "(╯°□°）╯︵ ┻━┻"
            });

        } else {
            utils.renderStories(res, stories, "Stories with label '" + label + "'");
        }
    });
});

module.exports = router;
