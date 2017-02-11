var storyDao = require('../dao/story');


module.exports = storyFetcher;

function storyFetcher() {
};

var internals = {};

internals.getStoriesByStatus = function (res, callback, projectId, status) {

    callback(null, {});

}


storyFetcher.getAllStories = function (res, projects, callback) {

    storyDao.getAllStories(function (error, results) {
        callback(null, results);
    });
};

storyFetcher.getStory = function (res, projectId, storyId, callback) {

    callback(null, {});

};

storyFetcher.getAllStoriesWithStatus = function (res, status, projects, callback) {

    callback(null, []);
};

storyFetcher.getAllStoriesWithLabel = function (res, label, projects, callback) {

    callback(null, []);
};
