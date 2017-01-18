var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var _DEFAULTS = {

};
var getConnectionString = function() {
    var secObj = JSON.parse(fs.readFileSync('dbauth.json', 'utf8'));
    return "mongodb://" + secObj.user + ":" + secObj.pass + "@" + secObj.host + ":" + secObj.port + "/" + secObj.database;
}

exports.fetchFromDB = function(id) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(getConnectionString()).then(function(db) {
            var collection = db.collection('videos');
            collection.findOne({"_id" : new ObjectId(id)}, function(error, result){
                resolve(result);
            });
    });
});
}

exports.validateUserExists = function(username, users) {
    return users.filter(function(object) {
        return object.username == username;
    });
}

exports.fetchUsers = function(){
    return new Promise(function(resolve, reject) {
        var object;
        MongoClient.connect(getConnectionString()).then(function(db) {
            var collection = db.collection('users');
            collection.find().toArray(function(err, results) {
                resolve(results);
            });
        });
    });
}

exports.validateLogin = function(username, password, users) {
    var hasUser = exports.validateUserExists(username, users).length != 0;
    if (hasUser) {
        var responseArray = users.filter(function(object) {
            return object.username == username && object.password == password;
        });
        return responseArray.length != 0;
    } else {
        return false;
    }
}

exports.registerUser = function(user){
        MongoClient.connect(getConnectionString(), function(err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var collection = db.collection('users');
        collection.insertOne(user, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Inserted user into users');
            }
            db.close();
        });
    });
}

exports.persist = function(video) {
    console.log(getConnectionString());
    MongoClient.connect(getConnectionString(), function(err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var collection = db.collection('videos');
        collection.insertOne(video, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Inserted entry into the "videos" collection');
            }
            db.close();
        });
    });
}

exports.find = function(keyword) {
    return new Promise(function(resolve, reject) {
        var object;
        MongoClient.connect(getConnectionString()).then(function(db) {
            var collection = db.collection('videos');
            collection.find({
                "videoName": {
                    "$regex": keyword
                }
            }).toArray(function(err, results) {
                console.log(results); // output all records
                resolve(results);
            });
        });
    });
}

exports.listHot = function(keyword) {
    return new Promise(function(resolve, reject) {
        var object;
        MongoClient.connect(getConnectionString()).then(function(db) {
            var collection = db.collection('videos');
            collection.find().sort({ views: -1 }).limit(5).toArray(function(err, results) {
                console.log(results); // output all records
                resolve(results);
            });
        });
    });
}

exports.listNew = function(keyword) {
    return new Promise(function(resolve, reject) {
        var object;
        MongoClient.connect(getConnectionString()).then(function(db) {
            var collection = db.collection('videos');
            collection.find().sort({ date: -1 }).limit(5).toArray(function(err, results) {
                console.log(results); // output all records
                resolve(results);
            });
        });
    });
}

exports.incrementView = function(video){
    MongoClient.connect(getConnectionString(), function(err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var collection = db.collection('videos');
        video.views = parseInt(video.views) + 1;
        collection.update({ _id: new ObjectId(video._id) }, video, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Updated ID: ' + video._id + ' with View: '+ video.views);
            }
            db.close();
        });
    });
}