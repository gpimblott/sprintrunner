'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');

var Persona = function () {
};

Persona.add = function (name, details, goal, avatar, done) {

  var params = [ name, details, goal, (avatar === null ? null : '\\x' + avatar.toString('hex')) ];

  var sql = "INSERT INTO personas ( name, details, goal, avatar) values ( $1 , $2 , $3 , $4) returning id";

  dbhelper.insert(sql, params,
    function (result) {
      done(result.rows[ 0 ].id, null);
    },
    function (error) {
      console.log(error);
      done(null, error);
    });
};

Persona.update = function (id, name, details, goal, avatar, done) {

  var avatar = (avatar === null ? null : '\\x' + avatar.toString('hex'));

  var sql = null;
  var params = null;
  if (avatar === null) {
    sql = "UPDATE personas set name=$2, details=$3, goal=$4 WHERE id=$1";
    params = [ id, name, details, goal];
  } else {
    sql = "UPDATE personas set name=$2, details=$3, goal=$4, avatar=$5 WHERE id=$1";
    params = [ id, name, details, goal, avatar ];
  }

  dbhelper.insert(sql, params,
    function (result) {
      done(result, null);
    },
    function (error) {
      console.log(error);
      done(null, error);
    });
};

Persona.getStory = function (storyId, done) {

}

Persona.getPersona = function (id, done) {
  var sql = "SELECT * FROM personas where id=$1";

  var params = [ id ];
  dbhelper.query(sql, params,
    function (results) {
      done(results[ 0 ], null);
    },
    function (error) {
      console.error(error);
      done(null, error);
    });
}

Persona.deletePersona = function (id, done) {
  var sql = "DELETE FROM personas where id=$1";

  var params = [ id ];
  dbhelper.query(sql, params,
    function (results) {
      done(results, null);
    },
    function (error) {
      console.error(error);
      done(null, error);
    });
}

Persona.getAllPersonas = function (done) {
  var sql = "SELECT id,name,details,goal FROM personas";

  var params = [];
  dbhelper.query(sql, params,
    function (results) {
      done(null, results);
    },
    function (error) {
      console.error(error);
      done(error, null);
    });
}

Persona.getNames = function (done) {
  var sql = "SELECT id,name FROM personas";

  var params = [];
  dbhelper.query(sql, params,
    function (results) {
      done(null, results);
    },
    function (error) {
      console.error(error);
      done(error, null);
    });
}

Persona.updateAvatar = function (id, avatar, done) {
  var params = [ id, '\\x' + avatar.toString('hex') ];

  var sql = "UPDATE personas SET avatar=$2 where id=$1";

  dbhelper.query(sql, params,
    function (result) {
      done(true);
    },
    function (error) {
      console.log(error);
      done(false, error);
    });
};

Persona.getAvatar = function (id, done) {
  var sql = "SELECT p.avatar FROM personas p where p.id=$1";

  dbhelper.query(sql, [ id ],
    function (results) {
      if (results[ 0 ].avatar) {
        done(new Buffer(results[ 0 ].avatar));
      } else {
        done(null);
      }
    },
    function (error) {
      console.log(error);
      done(null, error);
    });
};

module.exports = Persona;