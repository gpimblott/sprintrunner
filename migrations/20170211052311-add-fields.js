'use strict';

var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;
var fs = require('fs');
var path = require('path');


exports.setup = function(options, seedLink) {

};

exports.up = function(db, callback) {
    var filePath = path.join(__dirname + '/sqls/20170211052311-add-fields-up.sql');
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (err) return console.log(err);
        db.runSql(data, function(err) {
            if (err) return console.log(err);
            callback();
        });
    });
};

exports.down = function(db, callback) {
    var filePath = path.join(__dirname + '/sqls/20170211052311-add-fields-down.sql');
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (err) return console.log(err);
        db.runSql(data, function(err) {
            if (err) return console.log(err);
            callback();
        });
    });
};
