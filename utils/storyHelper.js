exports.renderStories = function (res, stories, title) {

  var stats = this.generateStoryStateMap( stories );

  res.render('stories/list-stories', {
    title: title,
    stories: stories,
    totalPoints: stats.total,
    notEstimated: stats.notEstimated,
    stateMap: stats.stateMap
  });
};

exports.generateStoryStateMap = function( stories ) {
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

    return { total : total, notEstimated: notEstimated , stateMap: stateMap};
}

