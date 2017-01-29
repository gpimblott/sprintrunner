var request = require('request');
var async = require('async');

module.exports = projectFetcher;

function projectFetcher () {};

var internals = {};

/**
 * Get the information for one project
 * @param res
 * @param callback
 * @param projectID ID of the project to retrieve
 */
internals.getProject = function (res, callback, projectID) {
  //Get the list of stories with the label
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + projectID,
    headers: {
      'X-TrackerToken': res.app.get('pivotalApiKey')
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
projectFetcher.getProjectSummary = function (res, projects, callback) {
  var projectArray = [];

  projects.forEach(function (projectID) {
    projectArray.push(function (callback) {
      internals.getProject(res, callback, projectID);
    })
  });

  async.parallel(projectArray,
    // Combine the results of the things above
    function (err, results) {
      if (err) {

        callback(err, null);

      } else {

        var projects = [];
        for (var j = 0; j < results.length; j++) {
          projects = projects.concat(results[ j ])
        }

        callback(null, projects);

      }
    })
};
