'use strict';

const debug = require('debug')('sprintrunner:storydao');
const pg = require('pg');
const dbHelper = require('../utils/dbhelper.js');
const dbQuery = require('../utils/dbquery.js');

const Story = function () {
};

Story.add = function (title, persona, status, description, reason, acceptance_criteria, estimate, team, done) {

    const query = new dbQuery();
    query.setTableName('stories');
    query.pushParam('title', title);
    query.pushParam('persona', persona);
    query.pushParam('status_id', status);
    query.pushParam('description', description);
    query.pushParam('reason', reason);
    query.pushParam('acceptance_criteria', acceptance_criteria);

    if (estimate !== null && estimate !== "") {
        query.pushParam('estimate', parseInt(estimate, 10));
    }

    if (team !== null && team !== undefined) {
        query.pushParam('team_id', parseInt(team, 10));
    }

    const sql = query.getInsertStatement();
    const params = query.getParams();

    dbHelper.insert(sql, params,
        function (result) {
            done(result.rows[ 0 ].id, null);
        },
        function (error) {
            debug(error);
            done(null, error);
        });
};

Story.update = function (id, title, persona, status, description, reason, acceptance_criteria, estimate, team, done) {

    var query = new dbQuery();
    query.setTableName('stories');
    query.pushParam('title', title);
    query.pushParam('persona', persona);
    query.pushParam('status_id', status);
    query.pushParam('description', description);
    query.pushParam('reason', reason);
    query.pushParam('acceptance_criteria', acceptance_criteria);

    if (estimate != null && estimate != "") {
        query.pushParam('estimate', parseInt(estimate, 10));
    }

    if (team != null && team != undefined) {
        query.pushParam('team_id', parseInt(team, 10));
    }

    var sql = query.getUpdateStatement('id', id);
    var params = query.getParams();

    debug(sql);

    dbHelper.insert(sql, params,
        function (result) {
            done(true, null);
        },
        function (error) {
            debug(error);
            done(false, error);
        });
};

Story.getStory = function (storyId, done) {
    var sql = "SELECT story.*, status.name as current_state, COALESCE( teams.name,'') as team_name,"
        + " personas.name as persona_name, "
        + " ( SELECT string_agg( l.name, ',') FROM story_label_link sll "
        + "   JOIN labels l on l.id=sll.label_id WHERE sll.story_id=story.id) as labels"
        + " FROM stories story"
        + " JOIN story_status status"
        + " ON story.status_id=status.id"
        + " JOIN personas"
        + " ON story.persona=personas.id"
        + " LEFT JOIN teams ON story.team_id=teams.id"
        + " WHERE story.id=$1;"

    var params = [ storyId ];
    dbHelper.query(sql, params,
        function (results) {
            done(null, results[ 0 ]);
        },
        function (error) {
            debug(error);
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
    dbHelper.query(sql, params,
        function (results) {
            done(null, results);
        },
        function (error) {
            debug(error);
            done(error, null);
        });
};

Story.getStoriesWithoutEpic = function (done) {
    var sql = "SELECT story.*, status.name as current_state, p.name as persona_name, "
        + " COALESCE( teams.name,'') as team_name"
        + " FROM stories story"
        + " JOIN story_status status ON story.status_id=status.id"
        + " JOIN personas p ON story.persona=p.id"
        + " LEFT JOIN teams ON story.team_id=teams.id"
        + " LEFT JOIN epic_story_link esl on esl.story_id=story.id"
        + " WHERE esl.id is null";

    var params = [];
    dbHelper.query(sql, params,
        function (results) {
            done(null, results);
        },
        function (error) {
            debug(error);
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
    dbHelper.query(sql, params,
        function (results) {
            done(null, results);
        },
        function (error) {
            debug(error);
            done(error, null);
        });
}

Story.getEpicForStory = function (storyId, done) {
    var sql = "select * from epics "
        + " join epic_story_link esl on epics.id = esl.epic_id"
        + " where esl.story_id = $1 limit 1;"

    var params = [ storyId ];
    dbHelper.query(sql, params,
        function (results) {
            done(null, results);
        },
        function (error) {
            debug(error);
            done(error, null);
        });
}

Story.getStoriesForEpic = function (epicId, done) {
    var sql = "SELECT story.*, status.name as current_state,"
        + " COALESCE( teams.name,'') as team_name"
        + " FROM stories story"
        + " JOIN epic_story_link esl"
        + " ON esl.story_id=story.id"
        + " JOIN story_status status"
        + " ON story.status_id=status.id"
        + " LEFT JOIN teams ON story.team_id=teams.id"
        + " WHERE esl.epic_id = $1;"

    var params = [ epicId ];
    dbHelper.query(sql, params,
        function (results) {
            done(null, results);
        },
        function (error) {
            debug(error);
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
    dbHelper.query(sql, params,
        function (results) {
            done(null, results);
        },
        function (error) {
            debug(error);
            done(error, null);
        });
}

Story.getStoriesWithPersona = function (personaName, done) {
    var sql = "SELECT story.*, status.name as current_state, p.name as persona_name,"
        + " COALESCE( teams.name,'') as team_name"
        + " FROM stories story"
        + " JOIN story_status status"
        + " ON story.status_id=status.id"
        + " JOIN personas p"
        + " ON story.persona=p.id"
        + " LEFT JOIN teams ON story.team_id=teams.id"
        + " WHERE p.name = $1;"

    var params = [ personaName ];
    dbHelper.query(sql, params,
        function (results) {
            done(null, results);
        },
        function (error) {
            debug(error);
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
    dbHelper.query(sql, params,
        function (results) {
            done(null, results);
        },
        function (error) {
            debug(error);
            done(error, null);
        });
}

Story.delete = function (id, done) {
    var params = [ id ];

    var sql = "DELETE FROM stories WHERE id = $1";

    dbHelper.query(sql, params,
        function (result) {
            done(null, true);
        },
        function (error) {
            debug(error);
            done(error, false);
        });
}

module.exports = Story;