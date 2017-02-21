'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var Epic = function () {
};

Epic.add = function (title, persona, description, reason, acceptance_criteria, done) {

  var sql = "INSERT INTO epics ( title, persona , description,reason,acceptance_criteria )"
    + " values ( $1 , $2 , $3, $4, $5) returning id";
  var params = [ title, persona, description, reason, acceptance_criteria ];

  dbhelper.insert(sql, params,
    function (result) {
      done(result.rows[ 0 ].id, null);
    },
    function (error) {
      console.log(error);
      done(null, error);
    });
};

Epic.update = function (id, title, persona, description, reason, acceptance_criteria, done) {

  var sql = "UPDATE epics SET title=$1, persona=$2, description=$3,reason=$4,acceptance_criteria=$5"
    + " WHERE id=$6";
  var params = [ title, persona, description, reason, acceptance_criteria, id ];

  dbhelper.insert(sql, params,
    function (result) {
      done(true, null);
    },
    function (error) {
      console.log(error);
      done(false, error);
    });
};

Epic.getEpic = function (storyId, done) {
  var sql = "SELECT epic.*, personas.name as persona_name"
    + " FROM epics epic"
    + " JOIN personas"
    + " ON epic.persona=personas.id"
    + " WHERE epic.id=$1;"

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

Epic.getAllEpics = function (done) {
  var sql = "SELECT * FROM epics";

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

Epic.delete = function (id, done) {
  var params = [ id ];

  var sql = "DELETE FROM epics WHERE id = $1";

  dbhelper.query(sql, params,
    function (result) {
      done(true);
    },
    function (error) {
      console.error(error);
      done(false, error);
    });
}

module.exports = Epic;