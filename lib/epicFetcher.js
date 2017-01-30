var request = require('request');
var async = require('async');

module.exports = epicFetcher;

function epicFetcher () {};

var internals = {};

/**
 * Get the information for one epic
 * @param res
 * @param callback
 * @param projectID ID of the project to retrieve
 */
internals.getEpic = function (res, callback, projectID ) {
  //Get the list of stories with the label
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + projectID + '/epics?fields=name,description,label,url',
    headers: {
      'X-TrackerToken': res.app.get('pivotalApiKey')
    }
  };

  request(options, function getStories (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback("Couldn't get epic thanks to this: " + response.statusCode, null);
    }
  });
}

/**
 * Get the eic information for the list of default projects
 * and render it using the epicsummary template
 * @param res
 * @param projects csv of project ids
 * @param callback Routine to call on completion
 */
epicFetcher.getEpicSummary = function (res, projects, callback) {
  var projectArray = [];

  projects.forEach(function (projectID) {
    projectArray.push(function (callback) {
      internals.getEpic(res, callback, projectID);
    })
  });

  async.parallel(projectArray,
    // Combine the results of the things above
    function (err, results) {
      if (err) {
        res.render('damn', {
          message: '┬──┬◡ﾉ(° -°ﾉ)',
          status: err,
          reason: "(╯°□°）╯︵ ┻━┻"
        });
      } else {

        var epics = [];
        for (var j = 0; j < results.length; j++) {
          epics = epics.concat(results[j])
        }

        callback( null , epics );

      }
    })
};
