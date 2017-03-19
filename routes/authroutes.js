'use strict';

var passport = require('passport');

var AuthRoutes = function () {
};

/*****************************************************
 * API Interfaces
 ******************************************************/
AuthRoutes.createRoutes = function (self) {

  self.app.get('/auth/google', passport.authenticate('google',
    {
      scope: [ 'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'],
      // prompt:'none',
      accessType: 'online',
      approvalPrompt: 'auto'
    }));

  self.app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/pages/index' }),
    function (req, res) {
      res.redirect('/');
    });

  self.app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
  });

}

module.exports = AuthRoutes;

