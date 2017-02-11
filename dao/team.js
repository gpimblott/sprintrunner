'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var teamCache = null;

var Team = function () {
};

/**
 * Get the cached team information
 */
Team.getTeamCache = function () {
    if (teamCache === null) {
        Team.getAllTeams(function (error , results){
            teamCache = results;
            return teamCache;
        });
    } else {
        return teamCache;
    }
};

Team.rebuildCache = function () {
    Team.getAllTeams(function (error , results) {
        teamCache = results;
    });
}

Team.add = function (name, description, done) {

    var sql = "INSERT INTO teams ( name, description ) values ( $1 , $2 ) returning id";
    var params = [title, description];

    dbhelper.insert(sql, params,
        function (result) {
            done(result.rows[0].id, null);
        },
        function (error) {
            console.log(error);
            done(null, error);
        });
};

Team.getAllTeams = function (done) {
    var sql = "SELECT * FROM teams";

    var params = [];
    dbhelper.query(sql, params,
        function (results) {
            done(null, results);
        },
        function (error) {
            console.error(error);
            done(error, null);
        });
}


Team.delete = function (id, done) {
    var params = [id];

    var sql = "DELETE FROM teams WHERE id = $1";

    dbhelper.query(sql, params,
        function (result) {
            done(true);
        },
        function (error) {
            console.error(error);
            done(false, error);
        });
}

module.exports = Team;