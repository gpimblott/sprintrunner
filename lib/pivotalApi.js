var request = require('request');
var async = require('async');

module.exports = pivotalApi;

function pivotalApi () {};

pivotalApi.getLabelsForProject = function (res, projectId, callback) {
  //Get the list of stories
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + projectId + '/labels?fields=name',
    headers: {
      'X-TrackerToken': res.app.get('pivotalApiKey')
    }
  };

  request(options, function getLabels (error, response, body) {
    if (!error && response.statusCode == 200) {
      var labelObjects = JSON.parse(body);
      var labels = [];

      labelObjects.forEach(function (object) {
        labels.push(object.name);
      })
      callback(null , labels);

    } else {
      callback(error , null );
    }
  });
}

pivotalApi.getLabelsForAllProjects = function (res, callback) {
  var projects = res.app.get('defaultProjects');
  var projectArray = [];

  projects.forEach(function (projectID) {
    projectArray.push(function (callback) {
      pivotalApi.getLabelsForProject(res, projectID, callback);
    })
  });

  async.parallel(projectArray,
    // Combine the results of the things above
    function (message ,results) {

      var labels = [];
      for (var j = 0; j < results.length; j++) {
        labels = labels.concat(results[ j ])
      }

      callback(labels);
    }
  )
};

/*
 * The following routines are the start of a conversion to use the 'bulk' aggregator
 * interface - but it's a bit of a pain and I don't have time
 */

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
      console.log(body);
      callback(null, JSON.parse(body));
    } else {
      callback("Couldn't get stories thanks to this: " + response.statusCode, null);
    }
  });
}