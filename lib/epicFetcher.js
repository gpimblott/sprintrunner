var request = require('request');
var async = require('async');

var pivotalApi = require('./pivotalApi');

module.exports = epicFetcher;

function epicFetcher () {};

var internals = {};

/**
 * Get the epic information for the list of default projects
 * and render it using the epicsummary template
 * @param res
 * @param projects csv of project ids
 * @param callback Routine to call on completion
 */
epicFetcher.getAllEpic = function (res, projects, callback) {

  var query = pivotalApi.aggregatorHelperAllProjects(projects, '/epics?fields=name,description,label,url');
  pivotalApi.aggregateQuery(res, query, function (error, results) {

    if(error) {
      callback( error , null );
      return;
    }

    var epics = [];
    for (var result in results) {
      epics = epics.concat(results[ result ])
    }

    callback(null, epics);
  });

};
