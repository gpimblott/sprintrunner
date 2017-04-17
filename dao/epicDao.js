"use strict";

const pg = require("pg");
const dbhelper = require("../utils/dbhelper.js");
const debug = require("debug")("sprintrunner:epics-dao");
const async = require("async");

var Epic = function () {};

/*
 * Reusable functions for use in transactions
 */
const rollback = function (client, error, cbk) {
    client.query("ROLLBACK", cbk);
};

const connectToDBFunction = function (cbk) {
    debug("connectionToDBFunction");
    dbhelper.setDefaults(pg);
    // pool.connect(function (error, client, release) {
    pg.connect(process.env.DATABASE_URL, function (error, client) {

        if (client === null) {
            debug("Error with DB client");
            rollback(client, error, cbk);
            cbk(error);
            return;
        }
        cbk(null, client);
    });
};

const beginTransactionFunction = function (client, cbk) {
    debug("beginTransactionFunction");
    client.query("BEGIN", function (error) {
        if (error) {
            debug("Error starting transaction");
            rollback(client, error, cbk);
            cbk(error);
            return;
        }

        cbk(null, client);
    });
};

const commitTransaction = function (client, cbk) {
    client.query("COMMIT", cbk);
};

Epic.add = function (title, persona, description, reason, acceptance_criteria, done) {

    var sql = "INSERT INTO epics ( title, persona , description,reason,acceptance_criteria, theorder )"
        + " values ( $1 , $2 , $3, $4, $5 , (select max(theorder)+1 FROM epics)) returning id";
    var params = [ title, persona, description, reason, acceptance_criteria ];

    dbhelper.insert(sql, params,
        function (result) {
            done(null, result.rows[ 0 ].id);
        },
        function (error) {
            console.error(error);
            done(error, null);
        });
};

Epic.linkStoryToEpic = function (epicId, storyId, done) {

    var sql = "INSERT INTO epic_story_link ( epic_id , story_id )"
        + " values ( $1 , $2 ) returning id";
    var params = [ epicId, storyId ];

    dbhelper.insert(sql, params,
        function (result) {
            done(null, result.rows[ 0 ].id);
        },
        function (error) {
            console.error(error);
            done(error, null);
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

/**
 * This has to use a transaction around a number of SQL updates to ensure that the correct record is updated
 * and all or none of the operation occur
 * @param from
 * @param fromId
 * @param to
 * @param done
 */
Epic.moveEpic = function (from, fromId, to, done) {

    from = parseInt(from, 10);
    fromId = parseInt(fromId, 10);
    to = parseInt(to, 10);

    const nullOriginalRecordFunction = function (client, cbk) {
        debug("nullOriginalRecord");
        client.query("UPDATE epics set theorder=null where theorder=$1 and id=$2", [ from, fromId ], function (error, result) {
            debug("Update count: %s", result.rowCount);
            if (error) {
                debug("Error updating Epic");
                rollback(client, error, cbk);
                cbk(error);
                return;
            }

            if (result.rowCount === 0) {
                debug("Original record not found");
                rollback(client, "Record not found", cbk);
                cbk("Row not found");
                return;
            }

            cbk(null, client);
        });
    };

    const moveOtherRecords = function (client, cbk) {
        var sql;
        if (from > to) {
            sql = "UPDATE epics set theorder = theorder+1 where theorder >= $2 and theorder < $1";
        }
        else {
            sql = "UPDATE epics set theorder = theorder-1 where theorder > $1 and theorder <= $2";
        }

        client.query(sql, [ from, to ], function (error, result) {
            debug("%s rows updated", result.rowCount);
            if (error) {
                debug("Error reordering rows");
                rollback(client, error, cbk);
                cbk(error);
                return;
            }
            cbk(null, client);
        });
    };

    const setRecordPositionFunction = function (client, cbk) {
        client.query("UPDATE epics set theorder=$1 where theorder is null", [ to ], function (error, result) {
            if (error) {
                debug("Error moving original Epic");
                rollback(client, error, cbk);
                cbk(error);
                return;
            }
            cbk(null, client);
        });
    };

    async.waterfall(
        [ connectToDBFunction,
            beginTransactionFunction,
            nullOriginalRecordFunction,
            moveOtherRecords,
            setRecordPositionFunction,
            commitTransaction ],
        function (error, result) {
            debug("Result : %s", result);
            if (error) {
                debug("Error moving record ");
            }
            done(error, result);
        });
};

Epic.getEpic = function (epicId, done) {
    var sql = "SELECT epic.*, personas.name as persona_name"
        + " FROM epics epic"
        + " LEFT JOIN personas"
        + " ON epic.persona=personas.id"
        + " WHERE epic.id=$1;";

    var params = [ epicId ];
    dbhelper.query(sql, params,
        function (results) {
            done(null, results[ 0 ]);
        },
        function (error) {
            console.error(error);
            done(error, null);
        });
};

Epic.getAllEpics = function (done) {
    var sql = "SELECT *, (SELECT COUNT(*) FROM epic_story_link esl WHERE epics.id = esl.epic_id) AS num_stories"
        + " FROM epics order by theorder asc";

    var params = [];
    dbhelper.query(sql, params,
        function (results) {
            done(results, null);
        },
        function (error) {
            console.error(error);
            done(null, error);
        });
};

/**
 * Delete the specified row - first change the ordering of the epics
 * THis is all done is a transaction to ensure consistency
 * @param id
 * @param done
 */
Epic.delete = function (id, done) {

    const deleteRecord = function (client, cbk) {
        var sql = "DELETE FROM epics WHERE id = $1";

        client.query(sql, [ id ], function (error, result) {
            debug("%s rows updated", result.rowCount);
            if (error) {
                debug("Error reordering rows");
                rollback(client, error, cbk);
                cbk(error);
                return;
            }
            cbk(null, client);
        });
    };

    const moveOtherRecords = function (client, cbk) {
        var sql = "UPDATE epics set theorder = theorder-1 where theorder > ( select theorder from epics where id=$1)";

        client.query(sql, [ id ], function (error, result) {
            debug("%s rows updated", result.rowCount);
            if (error) {
                debug("Error reordering rows");
                rollback(client, error, cbk);
                cbk(error);
                return;
            }
            cbk(null, client);
        });
    };

    async.waterfall(
        [ connectToDBFunction,
            beginTransactionFunction,
            moveOtherRecords,
            deleteRecord,
            commitTransaction ],
        function (error, result) {
            debug("Result : %s", result);
            if (error) {
                debug("Error deleting record ");
            }
            done(error, result);
        });

};

module.exports = Epic;