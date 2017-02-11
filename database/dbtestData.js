/**
 * This is a stand-alone application that inserts base data into the database
 * 
 * It assumes that the database has already been dreated
 */

// Load in the environment variables
require('dotenv').config({path:'process.env'});

var pg = require('pg');
var async = require('async');

var client = new pg.Client(process.env.DATABASE_URL);
client.connect();

var statements = [
    "INSERT INTO labels (name) VALUES ('test1')",
    "INSERT INTO labels (name) VALUES ('test2')",
    "INSERT INTO teams ( name , description ) VALUES ('Team Awesome' , 'A description of the team 1')",
    "INSERT INTO teams ( name , description ) VALUES ('Team More Awesome' , 'A description of the team 2')",
    "INSERT INTO stories ( title , description , status_id) VALUES ('story 1 title' , 'a full description 1' ," +
        " (select id from story_status where name='unscheduled'))",
    "INSERT INTO stories ( title , description , status_id) VALUES ('story 2 title' , 'a full description 2', " +
        " (select id from story_status where name='unscheduled'))",
    "INSERT INTO stories ( title , description , status_id) VALUES ('story 3 title' , 'a full description 3' ," +
    " (select id from story_status where name='unscheduled'))",
    "INSERT INTO stories ( title , description , status_id) VALUES ('story 4 title' , 'a full description 4', " +
    " (select id from story_status where name='unscheduled'))",
    "INSERT INTO stories ( title , description , status_id, team_id) VALUES ('story 5 title' , 'a full description 5', " +
    " (select id from story_status where name='started')," +
    " (select id from teams where name='Team Awesome')" + ")"
];

function doQuery(item, callback) {
    console.log("Query:" + item);
    client.query(item, function (err, result) {
        callback(err);
    })
}

async.eachSeries(statements, doQuery, function (err) {
    if (err) {
        console.error(err);
    } else {
        console.log("All Done");
        client.end();
    }

});
