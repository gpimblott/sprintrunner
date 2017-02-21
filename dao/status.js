'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var statusCache = null;

var Status = function () {
};

/**
 * Get the cached team information
 */
Status.getStatusCache = function () {
  return statusCache;
};

Status.rebuildCache = function () {
  Status.getAll(function (error, results) {
    statusCache = results;
  });
}

Status.getAll = function (done) {
  var sql = "SELECT * FROM story_status";

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

module.exports = Status;