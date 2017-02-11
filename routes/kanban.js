var express = require('express');
var router = express.Router();
var storyDao = require('../dao/story');

var internals = {};

internals.renderKanban = function (res, team, title) {

    var renderer = function (error, results) {

        if (error) {
            res.render('damn', {
                message: '┬──┬◡ﾉ(° -°ﾉ)',
                status: error,
                reason: "(╯°□°）╯︵ ┻━┻"
            });
        } else {

            var statusMap = {};
            results.forEach(function (story) {
                if (!(story.current_state in statusMap)) {
                    statusMap [story.current_state] = {stories: []};
                }

                statusMap [story.current_state].stories.push(story);
            })

            var notStarted = (statusMap ['not started'] === undefined ? [] : statusMap['not started'].stories);
            var started = (statusMap ['started'] === undefined ? [] : statusMap['started'].stories);
            var finished = (statusMap ['finished'] === undefined ? [] : statusMap['finished'].stories);

            res.render("kanban", {
                notStarted: notStarted,
                started: started,
                finished: finished,
                title: title
            });
        }
    };

    if (team === null) {
        storyDao.getAllStories(renderer);
    } else {
        storyDao.getStoriesForTeam(team, renderer);
    }
}

router.get('/', function (req, res, next) {
    internals.renderKanban(res, null, 'All projects');
});

router.get('/:teamName', function (req, res, next) {
    var teamName = decodeURIComponent(req.params["teamName"]);
    internals.renderKanban(res, teamName, teamName)
});

module.exports = router;


