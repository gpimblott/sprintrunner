"use strict";

var express = require("express");
var utils = require("../utils/storyHelper");
var router = express.Router();
var debug = require("debug")("sprintrunner:stories");

var storyDao = require('../dao/storyDao');
var epicDao = require('../dao/epicDao');
var teamDao = require('../dao/teamDao');
var personaDao = require('../dao/personaDao');
var sanitizer = require('sanitize-html');
var async = require('async');

router.get("/", function (req, res, next) {

    storyDao.getAllStories(function (error, stories) {
        if (error) {
            res.render("damm", {
                message: "Something went wrong)",
                status: error,
                reason: "Don't know what :("
            });

        } else {
            utils.renderStories(res, stories, "All Stories");
        }
    });
});


router.get("/noepic", function (req, res, next) {

    storyDao.getStoriesWithoutEpic(function (error, stories) {
        if (error) {
            res.render("damm", {
                message: "Something went wrong)",
                status: error,
                reason: "Don't know what :("
            });

        } else {
            utils.renderStories(res, stories, "Stories not assign to Epics");
        }
    });
});

router.get("/status/:status", function (req, res, next) {
    var status = decodeURIComponent(req.params[ "status" ]);

    storyDao.getStoriesWithStatus(status, function (error, stories) {
        if (error) {
            res.render("damn", {
                message: "Something went wrong",
                status: error,
                reason: "Don't know"
            });

        } else {
            utils.renderStories(res, stories, "Stories with status '" + status + "'");
        }
    });
});

router.get("/persona/:persona", function (req, res, next) {
    var persona = decodeURIComponent(req.params[ "persona" ]);

    storyDao.getStoriesWithPersona(persona, function (error, stories) {
        if (error) {
            res.render("damn", {
                message: "Something went wrong",
                status: error,
                reason: "Don't know"
            });

        } else {
            utils.renderStories(res, stories, "Stories for persona '" + persona + "'");
        }
    });
});

router.get("/team/:teamName", function (req, res, next) {
    var teamName = decodeURIComponent(req.params[ "teamName" ]);

    storyDao.getStoriesForTeam(teamName, function (error, stories) {
        if (error) {
            res.render("damn", {
                message: "Something went wrong",
                status: error,
                reason: "Don't know"
            });

        } else {
            utils.renderStories(res, stories, "Stories for Team");
        }
    });
});

router.get("/add/:epicId", function (req, res, next) {
    var epicId = req.params[ "epicId" ];
    personaDao.getNames(function (error, names) {

        res.render("stories/add-story", {
            personas: names,
            epic: epicId
        });
    });

});

router.get("/add", function (req, res, next) {

    personaDao.getNames(function (error, names) {
        res.render("stories/add-story", {
            personas: names,
        });
    })

});


router.get("/show/:storyId", function (req, res, next) {
    var storyId = req.params[ "storyId" ];

    debug('Showing story %d', storyId);

    async.parallel({
        story: function (callback) {
            storyDao.getStory(storyId, callback);
        },
        epic: function (callback) {
            storyDao.getEpicForStory(storyId, callback);
        },
        names: function (callback) {
            personaDao.getNames(callback);
        }
    }, function (error, results) {
        if (error) {
            res.render("damn", {
                message: "Something went wrong",
                status: error,
                reason: "Don't know"
            });

        } else {
            res.render("stories/show-story", {
                story: results.story,
                personas: results.names,
                epic: results.epic[0]
            });
        }
    });

});

/**
 * API tp update stories
 */


router.post("/:storyId", function (req, res, next) {
    var storyId = req.params[ "storyId" ];

    debug("Received update POST for %s", storyId);
    var title = sanitizer(req.body.title);
    var status = sanitizer(req.body.status);
    var estimate = sanitizer(req.body.estimate);
    var persona = sanitizer(req.body.persona);
    var description = sanitizer(req.body.description);
    var reason = sanitizer(req.body.reason);
    var team = sanitizer(req.body.team);
    var acceptance_criteria = sanitizer(req.body.acceptance_criteria);

    if( team === 0) {
        team = null;
    }

    storyDao.update(storyId, title, persona, status, description, reason, acceptance_criteria, estimate, team, function (result, error) {
        res.redirect("/stories/show/" + storyId);
    });

});

router.post("/", function (req, res, next) {
    var title = sanitizer(req.body.title);
    var status = sanitizer(req.body.status);
    var estimate = sanitizer(req.body.estimate);
    var persona = sanitizer(req.body.persona);
    var description = sanitizer(req.body.description);
    var reason = sanitizer(req.body.reason);
    var team = sanitizer(req.body.team);
    var acceptance_criteria = sanitizer(req.body.acceptance_criteria);

    var epicId = sanitizer(req.body.epicid);

    storyDao.add(title, persona, status, description, reason, acceptance_criteria, estimate, team, function (result, error) {
        if (result && epicId) {
            epicDao.linkStoryToEpic(epicId, result, function (error, result) {
                // Do nothing for now :(
            });
        }

        res.redirect("/stories");
    });
});

router.delete("/:storyId", function (req, res, next) {
    var storyId = req.params[ "storyId" ];

    storyDao.delete(storyId, function (error, result) {
        res.sendStatus(200);
        return;
    })
});

module.exports = router;
