"use strict";

var debug = require("debug")("sprintrunner:routes");

var routes = require("./index");
var labels = require("./labels");
var teams = require("./teams");
var epics = require("./epics");
var stories = require("./stories");
var roadmap = require("./roadmap");
var kanban = require("./kanban");
var persona = require("./personas");
var api = require("./api");

var sse = require("./sse");
var authroutes = require("./authroutes.js");

var SetupRoutes = function () {
};

SetupRoutes.setup = function (self) {

    // Setup the google routes
    authroutes.setup(self);

    // Check for the login route first - this can be accessed unauthenticated
    self.app.get("/login", function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect("/");
        } else {
            res.render("login", { layout: "main-login" });
        }

    });

    // Everything should be authenticated
    self.app.use(function (req, res, next) {
        if (req.isUnauthenticated()) {
            debug("Unauthenticated request caught : %s", req.path);
            if (req.path.startsWith("/api/")) {
                res.sendStatus(401);
                return;
            };
            res.redirect("/login");
        } else {
            debug("authenticated request : %s", req.path);
            next("route");
        }
    });

    // All of these routes should be authenticated
    self.app.use("/", routes);
    self.app.use("/labels", labels);
    self.app.use("/teams", teams);
    self.app.use("/epics", epics);
    self.app.use("/stories", stories);
    self.app.use("/roadmap", roadmap);
    self.app.use("/kanban", kanban);
    self.app.use("/personas", persona);
    self.app.use("/api", api);

    sse.setup(self);

};

module.exports = SetupRoutes;