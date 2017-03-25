"use strict";

var pg = require("pg");
var dbhelper = require("../utils/dbhelper.js");
var debug = require("debug")("sprintrunner:epics-dao");

var Epic = function () {
};

Epic.add = function (title, persona, description, reason, acceptance_criteria, done) {

  var sql = "INSERT INTO epics ( title, persona , description,reason,acceptance_criteria, theorder )"
    + " values ( $1 , $2 , $3, $4, $5 , (select max(theorder)+1 FROM epics)) returning id";
  var params = [ title, persona, description, reason, acceptance_criteria ];

  dbhelper.insert(sql, params,
    function (result) {
      done(result.rows[ 0 ].id, null);
    },
    function (error) {
      console.error(error);
      done(null, error);
    });
};

Epic.linkStoryToEpic = function (epicId, storyId, done) {

  var sql = "INSERT INTO epic_story_link ( epic_id , story_id )"
    + " values ( $1 , $2 ) returning id";
  var params = [ epicId, storyId ];

  dbhelper.insert(sql, params,
    function (result) {
      done(result.rows[ 0 ].id, null);
    },
    function (error) {
      console.error(error);
      done(null, error);
    });
};

Epic.update = function (id, title, persona, description, reason, acceptance_criteria, done) {

  var sql = "UPDATE epics SET title=$1, persona=$2, description=$3,reason=$4,acceptance_criteria=$5"
    + " WHERE id=$6";
  var params = [ title, persona, description, reason, acceptance_criteria, id ];

  dbhelper.insert(sql, params,
    function (result) {
      done(true, null);
    },
    function (error) {
      console.error(error);
      done(false, error);
    });
};

Epic.moveEpic = function (from, fromId, to, done) {

  from = parseInt(from, 10);
  fromId = parseInt(fromId, 10);
  to = parseInt(to, 10);

  dbhelper.connect(function (client, error) {

    if (client == null) {
      done(false, error);
      return;
    }

    var rollback = function (client) {
      //terminating a client connection will
      //automatically rollback any uncommitted transactions
      //so while it's not technically mandatory to call
      //ROLLBACK it is cleaner and more correct
      client.query("ROLLBACK", function () {
        client.end();
        return;
      });
    };

    client.query("BEGIN", function (err, result) {
      if (err) return rollback(client);
      debug("Updating from:%s id:%s", from, fromId);
      client.query("UPDATE epics set theorder=null where theorder=$1 and id=$2", [ from, fromId ], function (err, result) {
        debug("Update count: %s", result.rowCount);
        if (err) {
          rollback(client);
          done(null, err);
          return;
        }

        if (result.rowCount == 0) {
          rollback(client);
          done(null, "Epic order incorrect");
          return;
        }

        var sql;
        if (from > to) {
          sql = "UPDATE epics set theorder = theorder+1 where theorder >= $2 and theorder < $1";
        }
        else {
          sql = "UPDATE epics set theorder = theorder-1 where theorder > $1 and theorder <= $2";
        }

        client.query(sql, [ from, to ], function (err, result) {
          if (err) {
            rollback(client);
            done(false, err);
            return;
          }
          client.query("UPDATE epics set theorder=$1 where theorder is null", [ to ], function (err, result) {
            if (err) {
              rollback(client);
              done(false, err);
            }
            //disconnect after successful commit
            client.query("COMMIT", client.end.bind(client));

            done(true, null);
            return;
          });
        });
      });
    });
  });
}

Epic.getEpic = function (storyId, done) {
  var sql = "SELECT epic.*, personas.name as persona_name"
    + " FROM epics epic"
    + " JOIN personas"
    + " ON epic.persona=personas.id"
    + " WHERE epic.id=$1;"

  var params = [ storyId ];
  dbhelper.query(sql, params,
    function (results) {
      done(results[ 0 ], null);
    },
    function (error) {
      console.error(error);
      done(null, error);
    });
}

Epic.getAllEpics = function (done) {
  var sql = "SELECT * FROM epics order by theorder asc";

  var params = [];
  dbhelper.query(sql, params,
    function (results) {
      done(results, null);
    },
    function (error) {
      console.error(error);
      done(null, error);
    });
}

Epic.delete = function (id, done) {
  var params = [ id ];

  var sql = "DELETE FROM epics WHERE id = $1";

  dbhelper.query(sql, params,
    function (result) {
      done(true);
    },
    function (error) {
      console.error(error);
      done(false, error);
    });
}

module.exports = Epic;