"use strict";

var express = require("express");
var debug = require("debug")("sprintrunner:api-routes");
var router = express.Router();
var epicDao = require("../dao/epicDao");
var serverSideEvents = require("./sse");

router.get("/epics", function (req, res, next) {

    epicDao.getAllEpics(function (epics, error) {

        if (error) {
            debug("Error fetching all epics: %s", error);
            res.sendStatus(500);
        } else {
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify(epics));
            debug("All epics returned ok");
        };
    });
});

router.get("/notifications", function (req, res, next) {
    debug("Fetching notifications");

    function sendToSelfCheck(item) {
        return item.userid!==req.user.googleid;
    }

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(serverSideEvents.getLatestNotifications().filter( sendToSelfCheck)));
});

module.exports = router;