'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var Story = function () {
};

Story.add = function (title, persona, status, description, reason, acceptance_criteria, estimate,  done) {

  var sql = "INSERT INTO stories ( title, persona, status_id , description,reason,acceptance_criteria,estimate )"
    + " values ( $1 , $2 , $3, $4, $5, $6, $7 ) returning id";
  var params = [ title, persona, status, description, reason, acceptance_criteria, estimate ];

  dbhelper.insert(sql, params,
    function (result) {
      done(result.rows[ 0 ].id, null);
    },
    function (error) {
      console.log(error);
      done(null, error);
    });
};

Story.update = function (id , title, persona, status, description, reason, acceptance_criteria, estimate, done) {

  var sql = "UPDATE stories SET title=$1, persona=$2, status_id=$3 , description=$4,reason=$5,acceptance_criteria=$6,estimate=$7"
    + " WHERE id=$8";
  var params = [ title, persona, status, description, reason, acceptance_criteria, estimate, id ];

  dbhelper.insert(sql, params,
    function (result) {
      done(true, null);
    },
    function (error) {
      console.log(error);
      done(false, error);
    });
};

Story.getStory = function (storyId, done) {
  var sql = "SELECT story.*, status.name as current_state, COALESCE( teams.name,'') as team_name,"
    + " personas.name as persona_name"
    + " FROM stories story"
    + " JOIN story_status status"
    + " ON story.status_id=status.id"
    + " JOIN personas"
    + " ON story.persona=personas.id"
    + " LEFT JOIN teams ON story.team_id=teams.id"
    + " WHERE story.id=$1;"

  var params = [ storyId ];
  dbhelper.query(sql, params,
    function (results) {
      done(null, results[ 0 ]);
    },
    function (error) {
      console.error(error);
      done(error, null);
    });
}


Story.getAllStories = function (done) {
  var sql = "SELECT story.*, status.name as current_state, p.name as persona_name, "
    + " COALESCE( teams.name,'') as team_name"
    + " FROM stories story"
    + " JOIN story_status status"
    + " ON story.status_id=status.id"
    + " JOIN personas p"
    + " ON story.persona=p.id"
    + " LEFT JOIN teams ON story.team_id=teams.id";

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

Story.getStoriesForTeam = function (teamName, done) {
  var sql = "SELECT story.*, status.name as current_state, p.name as persona_name, "
    + " COALESCE( teams.name,'') as team_name"
    + " FROM stories story"
    + " JOIN story_status status"
    + " ON story.status_id=status.id"
    + " JOIN personas p"
    + " ON story.persona=p.id"
    + " LEFT JOIN teams ON story.team_id=teams.id"
    + " WHERE teams.name = $1;"

  var params = [ teamName ];
  dbhelper.query(sql, params,
    function (results) {
      done(null, results);
    },
    function (error) {
      console.error(error);
      done(error, null);
    });
}

Story.getStoriesWithStatus = function (statusName, done) {
  var sql = "SELECT story.*, status.name as current_state, p.name as persona_name,"
    + " COALESCE( teams.name,'') as team_name"
    + " FROM stories story"
    + " JOIN story_status status"
    + " ON story.status_id=status.id"
    + " JOIN personas p"
    + " ON story.persona=p.id"
    + " LEFT JOIN teams ON story.team_id=teams.id"
    + " WHERE status.name = $1;"

  var params = [ statusName ];
  dbhelper.query(sql, params,
    function (results) {
      done(null, results);
    },
    function (error) {
      console.error(error);
      done(error, null);
    });
}

Story.getStoriesWithLabel = function (labelName, done) {
  var sql = "select s.*, t.name as team_name ,ss.name as current_state, p.name as persona_name"
    + " FROM stories s"
    + " JOIN story_label_link sll ON sll.story_id=s.id"
    + " JOIN personas p ON s.persona=p.id"
    + " LEFT JOIN labels l ON sll.label_id=l.id"
    + " LEFT JOIN story_status ss ON ss.id=s.status_id"
    + " LEFT JOIN teams t ON t.id=s.team_id"
    + " WHERE l.name=$1";

  var params = [ labelName ];
  dbhelper.query(sql, params,
    function (results) {
      done(null, results);
    },
    function (error) {
      console.error(error);
      done(error, null);
    });
}

Story.delete = function (id, done) {
  var params = [ id ];

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