'use strict';

var pg = require('pg');
var dbhelper = require('../utils/dbhelper.js');


var Label = function () {
};



Label.add = function (name, done) {

    var sql = "INSERT INTO labels ( name ) values ( $1 ) returning id";
    var params = [name];

    dbhelper.insert(sql, params,
        function (result) {
            done(result.rows[0].id, null);
        },
        function (error) {
            console.log(error);
            done(null, error);
        });
};

Label.getAllLabels = function (done) {
    var sql = "SELECT * FROM labels";

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

Label.getLabelsForStory = function (storyId, done) {
    var sql = "SELECT * FROM labels";

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


Label.delete = function (id, done) {
    var params = [id];

    var sql = "DELETE FROM labels WHERE id = $1";

    dbhelper.query(sql, params,
        function (result) {
            done(true);
        },
        function (error) {
            console.error(error);
            done(false, error);
        });
}

module.exports = Label;