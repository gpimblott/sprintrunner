var express = require('express');
var router = express.Router();
var projectFetcher = require('../lib/projectFetcher');
var pivotalApi = require('../lib/pivotalApi');

var internals = {};

internals.renderKanban = function (res, projects, title) {
  var statuses = [ 'unstarted', 'started', 'finished' ];
  var queries = [];

  statuses.forEach(function (status) {
    projects.forEach(function (projectId) {
      var fullQuery =
        "/services/v5/projects/"
        + projectId
        + '/stories?date_format=millis&with_state='
        + encodeURIComponent(status)
        + '&fields=url,project_id,current_state,estimate,name,description,labels(name)';
      queries.push(fullQuery);
    });
  })

  var query = queries.length === 0 ? "[]" : "[\"" + queries.join("\",\"") + "\"]";

  pivotalApi.aggregateQuery(res, query, function (error, results) {

    if (error) {
      callback(error, null);
      return;
    }

    var statusMap = {};

    for (var queryResult in results) {
      var storyArray = results[ queryResult ];

      for (var i = 0; i < storyArray.length; i++) {
        var story = storyArray[i];

        if (!(story.current_state in statusMap)) {
          statusMap [ story.current_state ] = { stories: [] };
        }

        statusMap [ story.current_state ].stories.push(story);
      }
    }

    var notStarted = (statusMap [ 'unstarted' ]===undefined?[] : statusMap['unstarted'].stories);
    var started = (statusMap [ 'started' ]===undefined?[] : statusMap['started'].stories);
    var finished = (statusMap [ 'finished' ]===undefined?[] : statusMap['finished'].stories);

    res.render("kanban", {
      notStarted: notStarted,
      started: started,
      finished: finished,
      title: title
    });

  });


}

router.get('/', function (req, res, next) {
  internals.renderKanban(res, res.app.get('defaultProjects'), 'All projects');
});

router.get('/:projectId', function (req, res, next) {
  var projectId = req.params[ "projectId" ];
  internals.renderKanban(res, [ projectId ], projectFetcher.lookupProject(projectId))
});

module.exports = router;


