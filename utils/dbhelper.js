"use strict";

/**
 * Helper function to perform base database operations (e.g. query, insert)
 */
const pg = require("pg");
const url = require("url");

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(":");

const config = {
    user: auth[ 0 ],
    password: auth[ 1 ],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split("/")[ 1 ],
    ssl: process.env.USE_SSL,
    max: 20, //set pool max size to 20 - Max for free Heroku instance
    min: 4, //set min pool size to 4
    idleTimeoutMillis: 3000 //close idle clients after 3 seconds
};

var pool = new pg.Pool(config);
var debug = require("debug")("sprintrunner:dbhelper");

pool.on("error", function (e, client) {
    client.end();
    debug("DB Pool error: %s", e);
});

var DBHelper = function (){
};

DBHelper.setDefaults = function( pg ){
    if (process.env.USE_SSL && process.env.USE_SSL.toLowerCase() !== "false") {
        pg.defaults.ssl = true;
    }

    pg.defaults.poolSize = 20;
};
//
// DBHelper.connect = function (done) {
//     if (process.env.USE_SSL && process.env.USE_SSL.toLowerCase() !== "false") {
//         pg.defaults.ssl = true;
//     }
//
//     pg.defaults.poolSize = 20;
//
//     debug("Connecting");
//     pg.connect(process.env.DATABASE_URL, function (err, client, cdone) {
//
//         // Handle connection errors
//         if (err) {
//             debug("Error Connecting: %s", err);
//             if (client) {
//                 client.end();
//             }
//             done(null, err);
//         }
//         debug("Connected");
//         done(client, null);
//     });
// };

/**
 * Return the current DB connection pool to the caller
 * @returns {*}
 */
DBHelper.getPool = function () {
    return pool;
};

/**
 * Perform a select query operation
 * @param sql Statement to perform
 * @param parameters Parameters for the query
 * @param done Function to call on success
 * @param error Function to call on error
 */
DBHelper.query = function (sql, parameters, done, error) {

    debug("Query: %s", sql);
    pool.connect(function (err, client, release) {
        if (client == null) {
            debug("Client error");
            release();
            error(err);
        } else {
            debug("Connection OK");

            try {
                client.query(sql, parameters, function (err, result) {
                    debug("Query OK: %s rows", result.rows.length);
                    release();
                    done(result.rows);
                });
            } catch (e) {
                debug("Exception thrown : " + e);
                release(true);
            }
        }
    });
};

/**
 * Perform an insert operation on the database
 * @param sql Statement to perform
 * @param parameters Parameters for the query
 * @param done Function to call on exit
 * @param error Error function to call on error
 */
DBHelper.insert = function (sql, parameters, done, error) {
    // if (process.env.USE_SSL && process.env.USE_SSL.toLowerCase() !== 'false') {
    //   pg.defaults.ssl = true;
    // }

    debug("Inserting: %s", sql);
    pool.connect(function (err, client, release) {
        // pg.connect(process.env.DATABASE_URL, function (err, client) {
        // Handle connection errors
        if (err) {
            debug("Client error");
            if (client) {
                release();
            }
            error(err);
            return;
        }

        try {
            client.query(sql, parameters, function (err, result) {
                release();
                if (err) {
                    error(err);
                } else {
                    done(result);
                }
            });
        } catch (e) {
            debug("Exception thrown : " + e);
            release(true);
        }
    });
};

/**
 * Wrapper around delete function to delete by a set of ids
 * @param tableName
 * @param ids array of IDS to delete
 * @param done function to call on completion
 */
DBHelper.deleteByIds = function (tableName, ids, done) {

    var params = [];
    for (var i = 1; i <= ids.length; i++) {
        params.push("$" + i);
    }

    var sql = "DELETE FROM " + tableName + " WHERE id IN (" + params.join(',') + "  )";

    DBHelper.query(sql, ids,
        function (result) {
            done(true);
        },
        function (error) {
            console.log(error);
            done(false, error);
        });

}

DBHelper.getAllFromTable = function (tableName, done, order) {
    var sql = "SELECT * FROM " + tableName;
    var params = [];

    if (order != null) {
        sql = sql + " ORDER BY $1";
        params.push(order);
    }

    DBHelper.query(sql, params,
        function (results) {
            done(results);
        },
        function (error) {
            console.log(error);
            done(null);
        });
}

module.exports = DBHelper;