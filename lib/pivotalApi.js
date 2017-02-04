var request = require('request');
var async = require('async');

module.exports = pivotalApi;

function pivotalApi () {};

/**
 * Query all of the labels on all projects
 * @param res
 * @param callback
 */
pivotalApi.getLabelsForAllProjects = function (res, callback) {
  var projects = res.app.get('defaultProjects');

  var query = pivotalApi.aggregatorHelperAllProjects(projects, '/labels?fields=name');
  pivotalApi.aggregateQuery(res, query, function (error, results) {

    if (error) {
      callback(error, null);
      return;
    }

    var labels = [];
    for (var result in results) {
      results[ result ].forEach(function (label) {
        labels = labels.concat(label.name);
      });
    }

    callback(labels);
  });

};

/**
 * Build a body og GET queries to use with the Pivotal aggregator POST API call
 * @param projectId = ID of the project to search
 * @param queryString The base search path after the project id
 * @param parameters Array of parameters that should be placed after the baseURL
 */
pivotalApi.aggregatorHelperGetQuery = function (projectId, queryString, parameters) {
  var queries = [];

  parameters.forEach(function (parameter) {
    var fullQuery = "/services/v5/projects/" + projectId + queryString + parameter + "&envelope=true";
    queries.push(fullQuery);
  });

  return ( queries.length === 0 ? "[]" : "[\"" + queries.join("\",\"") + "\"]" );
}

/**
 * Build a body og GET queries to use with the Pivotal aggregator POST API call
 * @param projectID Array of project ids
 * @param queryString The query string to append
 */
pivotalApi.aggregatorHelperAllProjects = function (projectIds, queryString) {
  var queries = [];

  projectIds.forEach(function (projectId) {
    var fullQuery = "/services/v5/projects/" + projectId + queryString;// + "&envelope=true";
    queries.push(fullQuery);
  });

  return ( queries.length === 0 ? "[]" : "[\"" + queries.join("\",\"") + "\"]");
}

pivotalApi.aggregateQuery = function (res, query, callback) {
  //Get the list of stories
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/aggregator',
    headers: {
      'X-TrackerToken': res.app.get('pivotalApiKey'),
      'Content-Type': 'application/json'
    },
    body: query
  };

  request.post(options, function getStories (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback("Couldn't get stories thanks to this: " + response.statusCode, null);
    }
  });
}