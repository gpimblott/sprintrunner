var dbhelper = require('../utils/dbhelper.js');
var debug = require('debug')('sprintrunner:user');

var User = function () {
  this.id = 0;
  this.firstname = '';
  this.surname = '';
  this.googleid = '';
  this.fullname = '';
  this.email = '';
  this.picture = '';
  this.gender = '';
  this.googletoken = '';
};

// You need to assign a new function here
User.findOne = function (profile, done) {

  debug("findOne : %s", profile.id);
  var sql = "SELECT *  FROM users where googleid=$1 ";

  dbhelper.query(sql, [ profile.id ],
    function (results) {

      if (results.length == 0) {
        return done(null, null);
      }

      var user = User.recordToUser(results[ 0 ]);
      return done(null, user);
    },
    function (error) {
      console.error(error);
      return done(null, null);
    });
};

User.findById = function (id, done) {
  debug("findById : %s", id);

  var sql = "SELECT * FROM users where id=$1 ";

  dbhelper.query(sql, [ id ],
    function (results) {

      if (results.length == 0) {
        return done(null, null);
      } else {
        var user = User.recordToUser(results[ 0 ]);
        return done(null, user);
      }
    },
    function (error) {
      console.error(error);
      return done(null, null);
    });
};

User.prototype.save = function (done) {

  var sql = "INSERT INTO users ( firstname, surname, googleid, fullname, email,picture,gender,googletoken) " +
    "values ( $1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 ) returning id";
  var params = [ this.firstname, this.surname, this.googleid, this.fullname, this.email, this.picture, this.gender, this.googletoken ];

  dbhelper.insert(sql, params,
    function (result) {
      return done(result.rows[ 0 ].id);
    },
    function (error) {
      console.error(error);
      return done(null);
    });
}

User.updateAccessToken = function (userid, token, done) {
  var sql = "UPDATE users set googletoken = $2 WHERE id=$1";
  var params = [ userid, token ];

  dbhelper.query(sql, params,
    function (results) {
      done(results);
    },
    function (error) {
      console.error(error);
      return done(null);
    });
}

User.recordToUser = function (record) {
  var user = new User();
  user.id = record.id;
  user.firstname = record.firstname;
  user.surname = record.surname;
  user.googleid = record.googleid;
  user.fullname = record.fullname;
  user.email = record.email;
  user.picture = record.picture;
  user.gender = record.gender;
  user.googletoken = record.googletoken;

  return user;
}

module.exports = User;