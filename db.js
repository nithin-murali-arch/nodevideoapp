
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var event = require('./appevents');
var dbObj;

var getConnectionString = function () {
    var secObj = JSON.parse(fs.readFileSync('dbauth.json', 'utf8'));
    var userPass;
    if (secObj.user && secObj.pass) {
        userPass = secObj.user + ':' + secObj.pass + '@';
    }
    var mongoStr = "mongodb://" + (userPass ? userPass : '') + secObj.host + ":" + secObj.port + "/" + secObj.database;
    return mongoStr;
}

MongoClient.connect(getConnectionString()).then(function (db) {
    dbObj = db;
    event.eventObj.emit('dbInitialized');
});

exports.getOne = function (name, criteria) {
    var collection = dbObj.collection(name);
    return new Promise(function (resolve, reject) {
        collection.findOne(criteria, function (error, result) {
            resolve(result);
        });
    });
};

exports.get = function (name, criteria, sort, limit) {
    var collection = dbObj.collection(name);
    return new Promise(function (resolve, reject) {
        var search = collection.find(criteria);
        if(sort){
            search = search.sort(sort);
        }
        if(limit){
            search = search.limit(limit);
        }
        search.toArray(function (error, result) {
            resolve(result);
        });
    });
};

exports.add = function (name, Obj) {
    dbObj.collection(name).insertOne(Obj);
};

exports.update = function(name, criteria, obj){
    db.collection(name).update(criteria, obj);
};

exports.refreshDB = function () {
    dbObj.collection('videos').drop();
    dbObj.createCollection('videos');
};