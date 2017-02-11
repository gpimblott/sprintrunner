'use strict';

var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var fs = require('fs');
var path = require('path');

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
};

exports.up = function (db, callback) {
    var filePath = path.join(__dirname + '/sqls/20170211215751-split-story-description-up.sql');
    fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
        if (err) return console.log(err);
        db.runSql(data, function (err) {
            if (err) return console.log(err);
            callback();
        });
    });
};

exports.down = function (db, callback) {
    var filePath = path.join(__dirname + '/sqls/20170211215751-split-story-description-down.sql');
    fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
        if (err) return console.log(err);
        db.runSql(data, function (err) {
            if (err) return console.log(err);
            callback();
        });
    });
};
