var method = DBQuery.prototype;

function DBQuery() {
    this._fields = [];
    this._params = [];
    this._tableName = '';
}

method.pushParam = function(field , value) {
    this._fields.push(field);
    this._params.push(value);
};

method.setTableName = function(name) {
    this._tableName = name;
};

// var sql = "INSERT INTO stories ( title, persona, status_id, description,reason,acceptance_criteria,estimate,team_id )"
//     + " values ( $1 , $2 , $3, $4, $5, $6, $7 ,$8) returning id";
// var params = [ title, persona, status, description, reason, acceptance_criteria, estimate, team ];

method.getInsertStatement = function() {
    var sql = "INSERT INTO " + this._tableName + "(" + this._fields.join(',') + ") values ( ";

    var placeholders = [];
    for(var i=1; i<=this._fields.length;i++){
        placeholders.push('$' + i);
    }

    sql += placeholders.join(',');
    sql += ") returning id";

    return sql;
}

// var sql = "UPDATE stories SET title=$1, persona=$2, status_id=$3 , description=$4,reason=$5,acceptance_criteria=$6,estimate=$7";
// var params = [ title, persona, status, description, reason, acceptance_criteria, estimate, id ];

method.getUpdateStatement = function( whereColumn , whereValue) {

    var sql = "UPDATE " + this._tableName + " SET ";

    var columns = [];
    for (var i = 0; i < this._fields.length; i++) {
        columns.push(this._fields[ i ] + '=$' + (i + 1));
    }

    this._params.push(whereValue);

    sql += columns.join(',');
    sql += " WHERE " + whereColumn + "=$" + (this._params.length);

    return sql;
}

method.getParams = function() {
    return this._params;
}

module.exports = DBQuery;