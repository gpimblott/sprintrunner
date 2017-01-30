var request = require('request');
var async = require('async');
var personFetcher = require('./personFetcher');
var pivotalApi = require('./pivotalApi');

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

internals.getStoriesByStatus = function (res, callback, projectId, status) {
  //Get the list of stories
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + projectId + '/stories?date_format=millis&with_state=' + status,
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



internals.getAllStoriesWithLabel = function (res, callback, projectID, label) {
  //Get the list of stories with the label
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/'
    + projectID + '/stories?date_format=millis&fields=url,current_state,estimate,name,description,labels(name)&with_label=' + label,
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

internals.getStories = function (res, callback, projectID) {
  //Get the list of stories with the label
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/'
    + projectID + '/stories?fields=url,current_state,estimate,name,description,labels(name)&date_format=millis',
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

storyFetcher.getAllStories = function (res, projects, callback) {
  var projectArray = [];

  projects.forEach(function (projectID) {
    projectArray.push(function (callback) {
      internals.getStories(res, callback, projectID);
    })
  });

  async.parallel(projectArray,
    // Combine the results of the things above
    function (err, results) {
      if (err) {
        callback(err, null);
      } else {
        var stories = [];
        for (var j = 0; j < results.length; j++) {
          stories = stories.concat(results[ j ])
        }

        callback(null, stories);
      }
    }
  )
};

/**
 * Get the stories with the specified status for all of the default projects
 * @param res
 * @param status The Status to search for
 * @param array of project ids we are interested in
 * @param callback Function to call with the result
 */
storyFetcher.getAllStoriesWithStatus = function (res, status, projects, callback) {
  var projectArray = [];

  projects.forEach(function (projectID) {
    projectArray.push(function (callback) {
      internals.getStoriesByStatus(res, callback, projectID, status);
    })
  });

  async.parallel(projectArray,
    // Combine the results of the things above
    function (err, results) {
      if (err) {
        callback(err, null);
      } else {
        var stories = [];
        for (var j = 0; j < results.length; j++) {
          stories = stories.concat(results[ j ])
        }

        callback(null, stories);
      }
    }
  )
};

/**
 * Get the stories with the specified label for all of the default projects
 * @param res
 * @param label The label to search for
 * @param array of project ids we are interested in
 * @param callback Function to call with the result
 */
storyFetcher.getAllStoriesWithLabel = function (res, label, projects, callback) {
  var projectArray = [];

  projects.forEach(function (projectID) {
    projectArray.push(function (callback) {
      internals.getAllStoriesWithLabel(res, callback, projectID, label);
    })
  });

  async.parallel(projectArray,
    // Combine the results of the things above
    function (err, results) {
      if (err) {
        callback(err, null);
      } else {
        var stories = [];
        for (var j = 0; j < results.length; j++) {
          stories = stories.concat(results[ j ])
        }

        callback(null, stories);
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