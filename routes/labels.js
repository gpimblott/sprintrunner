var express = require('express');
var router = express.Router();
var storyFetcher = require('../lib/storyFetcher');
var pivotalApi = require('../lib/pivotalApi')

router.get('/', function (req, res, next) {
  pivotalApi.getLabelsForProject(res, function (labels) {
    res.render('labels', {
      projectId: res.app.get('pivotalProjectId'),
      defaultLabels: res.app.get('defaultLabels').split(','),
      labels: labels
    });
  })

});

router.get("/:labelName", function (req, res, next) {
  storyFetcher.getLabelSummary(res, req.params[ "labelName" ] , res.app.get('defaultProjects').split(','));
});

module.exports = router;
