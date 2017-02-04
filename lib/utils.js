var basicAuth = require('basic-auth')

exports.basicAuth = function(username, password) {
  return function(req, res, next) {
    if (!username || !password) {
      return res.send('<h1>༼ つ ◕_◕ ༽つ AWWWW SNAP!</h1><p>Username or password not set. Probably go do that, given you turned on basic auth, you set it in environment variables.');
    }

    var user = basicAuth(req)
    if (!user || user.name !== username || user.pass !== password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
      return res.sendStatus(401)
    }

    next()
  }
}

exports.renderStories = function (res, stories, title) {
  var total = 0;
  var notEstimated = 0;

  var stateMap = {};

  for (var i = 0; i < stories.length; i++) {
    var story = stories[ i ];

    var estimate = story.estimate;
    if (estimate === 'undefined' || typeof estimate != 'number') {
      estimate = 0;
      notEstimated++;
    }

    // Count the stories for each state
    if (story.current_state in stateMap) {
      stateMap[ story.current_state ].count += 1;
      stateMap[ story.current_state ].points += estimate;
    } else {
      stateMap[ story.current_state ] = { count: 1, points: estimate };
    }

    total += estimate;
  }

  res.render('stories', {
    title: title,
    stories: stories,
    totalPoints: total,
    notEstimated: notEstimated,
    stateMap: stateMap
  });
}

