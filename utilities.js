var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var _DEFAULTS = {

};
var getConnectionString = function() {
    var secObj = JSON.parse(fs.readFileSync('dbauth.json', 'utf8'));
    return "mongodb://" + secObj.host + ":" + secObj.port + "/" + secObj.database;
}

exports.fetchFromDB = function(id) {
    return 'C:/Users/nithin.murali/Downloads/movie.mp4';
}

exports.validateUserExists = function(username) {
    return users.filter(function(object) {
        return object.username == username;
    });
}

exports.validateLogin = function(username, password) {
    var hasUser = validateUserExists(username).length != 0;
    if (hasUser) {
        var responseArray = users.filter(function(object) {
            return object.username == username && object.password == password;
        });
        return responseArray.length != 0;
    } else {
        return false;
    }
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
                "name": {
                    "$regex": keyword
                }
            }).toArray(function(err, results) {
                console.log(results); // output all records
                resolve(results.length > 0 ? results[0] : undefined);
            });
        });
    });
}