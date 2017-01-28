var request = require('request');
var async = require('async');
var personFetcher = require('./personFetcher');
var findBusinessDaysInRange = require('find-business-days-in-range').calc

module.exports = storyFetcher;

function storyFetcher () {};

var internals = {};
const TRANSITION_ERROR_CODE = -99;

internals.getStoryViewModel = function (storyDetail, membershipInfo, transitions) {
  var viewModels = storyDetail.map(function (story) {
    var workers = story.owner_ids.map(function (worker_id) {
      return personFetcher.mapPersonFromId(worker_id, membershipInfo);
    });
    var signOffBy = personFetcher.mapPersonFromId(story.requested_by_id, membershipInfo);
    var daysInProgress = internals.calculateDaysInProgress(story.id, story.current_state, transitions);
    return {
      id: story.id,
      name: story.name,
      signOffBy: signOffBy,
      workers: workers,
      daysInProgress: daysInProgress
    }
  });

  return viewModels;
}

internals.getStoriesByStatus = function (res, callback, status) {
  //Get the list of stories
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + res.app.get('pivotalProjectId') + '/stories?date_format=millis&with_state=' + status,
    headers: {
      'X-TrackerToken': res.app.get('pivotalApiKey')
    }
  };

  request(options, function getStories (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback("Couldn't get stories thanks to this: " + response.statusCode, null);
    }
  });
}

internals.getStoriesWithLabel = function (res, callback, projectID, label) {
  console.log("Getting stories for : " + projectID)
  //Get the list of stories with the label
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + projectID + '/stories?date_format=millis&with_label=' + label,
    headers: {
      'X-TrackerToken': res.app.get('pivotalApiKey')
    }
  };

  request(options, function getStories (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback("Couldn't get stories thanks to this: " + response.statusCode, null);
    }
  });
}

internals.getStoryTransitions = function (res, callback) {
  // making assumption we always do work within 2 weeks. Anything beyond we don't care about
  var twoWeeksAgoISO8601 = new Date(+new Date - 12096e5).toISOString();

  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + res.app.get('pivotalProjectId') + '/story_transitions?occurred_after=' + twoWeeksAgoISO8601,
    headers: {
      'X-TrackerToken': res.app.get('pivotalApiKey')
    }
  };

  request(options, function getStories (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback("Couldn't get transitions thanks to this crap: " + response.statusCode, null);
    }
  });
}

internals.calculateDaysInProgress = function (storyId, storyState, transitions) {
  // Gather relevant transitions
  var storyTransitions = transitions.filter(function (transition) {
    return transition.story_id === storyId && transition.state === storyState;
  });

  // assume an error until we find a valid value
  var diffDays = TRANSITION_ERROR_CODE;
  if (storyTransitions.length > 0) {
    var mostRecentTransitionDate = new Date(Math.max.apply(null, storyTransitions.map(function (transition) {
      return new Date(transition.occurred_at);
    })));

    diffDays = findBusinessDaysInRange(mostRecentTransitionDate, new Date()).length;
  }

  return diffDays;
}

/**
 * Get the stories with the specified label for all of the default projects
 * @param res
 * @param label The label to search for
 * @param projects CSV of the projects ids to search
 */
storyFetcher.getLabelSummary = function (res, label, projects) {
  var projectArray = [];

  projects.forEach(function (projectID) {
    projectArray.push(function (callback) {
      internals.getStoriesWithLabel(res, callback, projectID, label);
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

        var total = 0;
        var notEstimated = 0;

        var stories = [];
        for (var j = 0; j < results.length; j++) {
          stories = stories.concat(results[j])
        }

        for (var i = 0; i < stories.length; i++) {
          var story = stories[ i ];
          if (typeof story.estimate != "number") {
            notEstimated++;
          } else {
            total += story.estimate;
          }
        }

        res.render('labelsummary', {
          label: label,
          totalPoints: total,
          notEstimated: notEstimated,
          stories: stories
        });
      }
    }
  )
};

storyFetcher.getStorySummary = function (res) {
  async.parallel([
      function (callback) {
        internals.getStoriesByStatus(res, callback, "started");
      },
      function (callback) {
        personFetcher.getMembers(res, callback);
      },
      function (callback) {
        internals.getStoriesByStatus(res, callback, "finished");
      },
      function (callback) {
        internals.getStoriesByStatus(res, callback, "delivered");
      },
      function (callback) {
        internals.getStoriesByStatus(res, callback, "rejected");
      },
      function (callback) {
        internals.getStoriesByStatus(res, callback, "unscheduled");
      },
      function (callback) {
        internals.getStoryTransitions(res, callback);
      }
    ],
    // Combine the results of the things above
    function (err, results) {
      if (err) {
        res.render('damn', {
          message: '┬──┬◡ﾉ(° -°ﾉ)',
          status: err,
          reason: "(╯°□°）╯︵ ┻━┻"
        });
      } else {
        var startedStories = internals.getStoryViewModel(results[ 0 ], results[ 1 ], results[ 5 ]);
        var finishedStories = internals.getStoryViewModel(results[ 2 ], results[ 1 ], results[ 5 ]);
        var deliveredStories = internals.getStoryViewModel(results[ 3 ], results[ 1 ], results[ 5 ]);
        var rejectedStories = internals.getStoryViewModel(results[ 4 ], results[ 1 ], results[ 5 ]);
        var reviewSlotsFull = res.app.get('reviewSlotsLimit') <= finishedStories.length;
        var approveSlotsFull = res.app.get('signOffSlotsLimit') <= deliveredStories.length;

        res.render('index', {
          projectId: res.app.get('pivotalProjectId'),
          story: startedStories,
          finishedStory: finishedStories,
          deliveredStory: deliveredStories,
          rejectedStory: rejectedStories,
          reviewSlotsFull: reviewSlotsFull,
          approveSlotsFull: approveSlotsFull
        });
      }
    });
}