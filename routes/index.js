var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {

  if (req.isAuthenticated()) {
    res.render("index", {  layout: 'main-index' });
  } else {
    res.redirect('/login');
  }

});

module.exports = router;