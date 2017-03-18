// load the google module
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;

// load up the user model
var User = require('../models/user');


passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (user, done) {

  User.findById(user, function (err, user) {
    if (err) {
      done(err);
    }

    done(err, user);
  });
});

var address = process.env.OPENSHIFT_NODEJS_IP;
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8090;
var callback;

if (address == undefined) {
  address = "localhost";
  callback = "http://" + address + ":" + port + "/auth/google/callback";
} else {
  callback = "http://sprintrunner.digidad.space/auth/google/callback";
}

// =========================================================================
// GOOGLE ==================================================================
// =========================================================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callback
  },
  function (accessToken, refreshToken, profile, done) {

    console.log("accessToken: %s : refreshToken : %s", accessToken, refreshToken);
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function () {

      // try to find the user based on their google credentials
      User.findOne(profile, function (err, user) {

        if (err) {
          return done(err);
        }

        if (user) {
          console.log('User found');
          if (user.googletoken != accessToken) {
            user.googletoken = accessToken;
            User.updateAccessToken(user.id, accessToken, function (error) {
              console.log("Token updated");
            })
          }

          return done(null, user);
        } else {
          console.log('No User found');

          var newUser = new User();

          // set all of the relevant information
          newUser.firstname = profile.name.givenName;
          newUser.surname = profile.name.familyName;
          newUser.googleid = profile.id;
          newUser.fullname = profile.displayName;
          newUser.email = profile.email; // pull the first email
          newUser.picture = profile.photos[ 0 ].value;
          newUser.gender = profile.gender;
          newUser.googletoken = accessToken;

          // save the user
          newUser.save(function (id) {
            console.log('created new user');
            if (id == null) {
              return done(null, false);
            }
            newUser.id = id;
            return done(null, newUser);
          });
        }
      });
    });

  }));


