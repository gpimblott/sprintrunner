'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var Story = function () {
};

Story.add = function (title, description, done) {

    var sql = "INSERT INTO stories ( title, description ) values ( $1 , $2 ) returning id";
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

Story.getStory = function (storyId, done) {
    var sql = "SELECT story.*, status.name as current_state, COALESCE( teams.name,'Not assigned') as team_name"
        + " FROM stories story"
        + " JOIN story_status status"
        + " ON story.status_id=status.id"
        + " LEFT JOIN teams ON story.team_id=teams.id"
        + " WHERE story.id=$1;"

    var params = [storyId];
    dbhelper.query(sql, params,
        function (results) {
            done(null , results[0]);
        },
        function (error) {
            console.error(error);
            done(error , null );
        });
}

Story.getAllStories = function (done) {
    var sql = "SELECT story.*, status.name as current_state, COALESCE( teams.name,'Not assigned') as team_name"
     + " FROM stories story"
     + " JOIN story_status status"
     + " ON story.status_id=status.id"
     + " LEFT JOIN teams ON story.team_id=teams.id;";

    var params = [];
    dbhelper.query(sql, params,
        function (results) {
            done(null , results);
        },
        function (error) {
            console.error(error);
            done(error , null );
        });
}

Story.getStoriesForTeam = function (teamName, done) {
    var sql = "SELECT story.*, status.name as current_state, COALESCE( teams.name,'Not assigned') as team_name"
        + " FROM stories story"
        + " JOIN story_status status"
        + " ON story.status_id=status.id"
        + " LEFT JOIN teams ON story.team_id=teams.id"
        + " WHERE teams.name = $1;"

    var params = [teamName];
    dbhelper.query(sql, params,
        function (results) {
            done(null , results);
        },
        function (error) {
            console.error(error);
            done(error , null );
        });
}

Story.getStoriesWithStatus= function (statusName, done) {
    var sql = "SELECT story.*, status.name as current_state, COALESCE( teams.name,'Not assigned') as team_name"
        + " FROM stories story"
        + " JOIN story_status status"
        + " ON story.status_id=status.id"
        + " LEFT JOIN teams ON story.team_id=teams.id"
        + " WHERE status.name = $1;"

    var params = [statusName];
    dbhelper.query(sql, params,
        function (results) {
            done(null , results);
        },
        function (error) {
            console.error(error);
            done(error , null );
        });
}

Story.getStoriesWithLabel= function (labelName, done) {
    var sql = "select s.*, t.name as team_name ,ss.name as current_state"
        + " from stories s"
        + " join story_label_link sll on sll.story_id=s.id"
        + " left join labels l on sll.label_id=l.id"
        + " left join story_status ss on ss.id=s.status_id"
        + " left join teams t on t.id=s.team_id"
        + " where l.name=$1";

    var params = [labelName];
    dbhelper.query(sql, params,
        function (results) {
            done(null , results);
        },
        function (error) {
            console.error(error);
            done(error , null );
        });
}

Story.delete = function (id, done) {
    var params = [id];

    var sql = "DELETE FROM stories WHERE id = $1";

    dbhelper.query(sql, params,
        function (result) {
            done(true);
        },
        function (error) {
            console.error(error);
            done(false, error);
        });
}

module.exports = Story;