var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');
var pivotalApi = require('../lib/pivotalApi');


router.get('/', function (req, res, next) {
  var queryStr = req.query.query;
  console.log(queryStr);

  var query = pivotalApi.aggregatorHelperAllProjects(res.app.get('defaultProjects'),
    '/search?query=' + encodeURIComponent(queryStr));
  pivotalApi.aggregateQuery(res, query, function (error, results) {

    if(error) {
      res.render('damn', {
        message: '┬──┬◡ﾉ(° -°ﾉ)',
        status: error,
        reason: "(╯°□°）╯︵ ┻━┻"
      });
    } else {

      console.log(results);
      var stories = [];
      for (var result in results) {
        stories = stories.concat(results[ result ].stories.stories)
      }
      utils.renderStories(res, stories, "Search results for '" + queryStr +"'");
    }
  });

});

module.exports = router;
