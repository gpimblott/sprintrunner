"use strict";

var express = require("express");
var debug = require("debug")("sprintrunner:epics-route");
var router = express.Router();
var epicDao = require("../dao/epicDao");
var storyDao = require("../dao/storyDao");
var personaDao = require("../dao/personaDao");
var sanitizer = require("sanitize-html");
var sse = require("../routes/sse");

router.get("/", function (req, res, next) {
    res.render("epics/list-epics", {});
});

router.get("/add", function (req, res, next) {
    personaDao.getNames(function (error, names) {

        res.render("epics/add-epic", {
            personas: names
        });
    });
});

router.get("/:epicId", function (req, res, next) {
    var epicId = req.params[ "epicId" ];

    epicDao.getEpic(epicId, function (error, epic) {
        personaDao.getNames(function (error, names) {
            storyDao.getStoriesForEpic(epicId, function (error, stories) {

                if (error) {
                    res.render("damn", {
                        message: "Something went wrong",
                        status: error,
                        reason: "Don't know why"
                    });

                } else {
                    res.render("epics/show-epic", {
                        epic: epic,
                        personas: names,
                        stories: stories
                    });
                }
            });
        });
    });
});

router.get("/delete/:epicId", function (req, res, next) {
    var epicId = req.params[ "epicId" ];

    epicDao.delete(epicId, function (error, result) {
        res.redirect("/epics");
    });
});

/**
 * Update methods
 */
router.post("/:epicId", function (req, res, next) {
    var epicId = req.params[ "epicId" ];
    var title = sanitizer(req.body.title);
    var persona = sanitizer(req.body.persona);
    var description = sanitizer(req.body.description);
    var reason = sanitizer(req.body.reason);
    var acceptance_criteria = sanitizer(req.body.acceptance_criteria);

    epicDao.update(epicId, title, persona, description, reason, acceptance_criteria, function (result, error) {
        res.redirect("/epics/" + epicId);
    });
});

// Add a new Epic
router.post("/", function (req, res, next) {
    var title = sanitizer(req.body.title);
    var persona = sanitizer(req.body.persona);
    var description = sanitizer(req.body.description);
    var reason = sanitizer(req.body.reason);
    var acceptance_criteria = sanitizer(req.body.acceptance_criteria);

    epicDao.add(title, persona, description, reason, acceptance_criteria, function (error, result) {
        var data = {};
        data.type = "epic-add";
        data.icon = req.user.picture;
        data.title = req.user.firstname + " " + req.user.surname;
        data.userid = req.user.googleid;
        data.message = "New epic added : " + title;

        sse.sendMsgToClients(data);

        res.redirect("/epics");
    });
});

// Update the order of an epic
router.patch("/:from/:fromId/:to", function (req, res, next) {
    var from = req.params[ "from" ];
    var fromId = req.params[ "fromId" ];
    var to = req.params[ "to" ];
    debug("Moving epic: %s (%s) to %s", from, fromId, to);

    if (to === null || from === null || from === "null" || to === "null" || from === to) {
        debug("Invalid parameters - PATCH ignored");
        res.sendStatus(200);
        return;
    }

    epicDao.moveEpic(from, fromId, to, function ( error , result ) {
        if (error) {
            debug("Error moving epic");
            res.sendStatus(500);
            return;
        } else {

            var data = {};
            data.type = "epic-move";
            data.icon = req.user.picture;
            data.title = req.user.firstname + " " + req.user.surname;
            data.from = from;
            data.to = to;
            data.userid = req.user.googleid;
            data.message = "Epics re-ordered please refresh lists";
            data.time = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

            sse.sendMsgToClients(data);

            debug("PATCH successful");
            res.sendStatus(200);
            return;
        }
    });
});

module.exports = router;