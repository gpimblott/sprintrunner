var request = require('request');
var async = require('async');

module.exports = projectFetcher;

function projectFetcher () {};

var internals = {};

var projectCache;

/**
 * Get the information for one project
 * @param res
 * @param callback
 * @param projectID ID of the project to retrieve
 */
internals.getProject = function (callback, apiKey, projectID) {
  //Get the list of stories with the label
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + projectID + '?fields=name,description',
    headers: {
      'X-TrackerToken': apiKey
    }
  };

  request(options, function getStories (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback("Couldn't get project thanks to this: " + response.statusCode, null);
    }
  });
}

/**
 * Get the project information for the list of default projects
 * and render it using the projectsummary template
 * @param res
 * @param projects csv of project ids
 */
projectFetcher.buildProjectCache = function (apiKey, projects) {
  var projectArray = [];

  projects.forEach(function (projectID) {
    projectArray.push(function (callback) {
      internals.getProject(callback, apiKey, projectID);
    })
  });

  async.parallel(projectArray,
    // Combine the results of the things above
    function (err, results) {
      if (err) {

        console.log("Error building project Cache: " + err);

      } else {

        var projects = [];
        for (var j = 0; j < results.length; j++) {
          projects = projects.concat(results[ j ])
        }

        projectCache = projects;
      }
    })
};

/**
 * Get the cached project information
 */
projectFetcher.getProjectSummary = function () {
  return projectCache;
};

/**
 * Get the name of a project given the id
 * @param projectId
 * @returns {string}
 */
projectFetcher.lookupProject = function (projectId) {
  for (var i = 0; i < projectCache.length; i++) {
    if (projectCache[ i ].id == projectId) {
      return projectCache[ i ].name;
    }
  }
  return 'Project not found';
}


