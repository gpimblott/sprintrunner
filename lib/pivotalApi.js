var request = require('request');

module.exports = pivotalApi;

function pivotalApi () {};

pivotalApi.getLabelsForProject = function (res , callback) {
  //Get the list of stories
  var options = {
    url: 'https://www.pivotaltracker.com/services/v5/projects/' + res.app.get('pivotalProjectId') + '/labels?fields=name',
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
      callback( labels );

    } else {
      callback([]);
    }
  });
}