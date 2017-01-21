var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var ffmpeg = require('fluent-ffmpeg');
var ObjectId = require('mongodb').ObjectID;
var _DEFAULTS = {
    connTimeout: 1000 //millis
};

var closeConnection = function (db) {
    setTimeout(function () {
        db.close();
    }, _DEFAULTS.connTimeout);
};

var getConnectionString = function () {
    var secObj = JSON.parse(fs.readFileSync('dbauth.json', 'utf8'));
    var userPass;
    if (secObj.user && secObj.pass) {
        userPass = secObj.user + ':' + secObj.pass + '@';
    }
    var mongoStr = "mongodb://" + (userPass ? userPass : '') + secObj.host + ":" + secObj.port + "/" + secObj.database;
    return mongoStr;
}

var prepareThumbnail = function (videoPath) {
    var proc = new ffmpeg('videoPath').takeScreenshots({
        count: 1,
        timemarks: ['600'] // number of seconds
    }, './public/appVideos/thumbnails', function (err) {
        console.log('screenshots were saved')
    });
}

exports.fetchFromDB = function (id) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(getConnectionString()).then(function (db) {
            var collection = db.collection('videos');
            collection.findOne({ "_id": new ObjectId(id) }, function (error, result) {
                closeConnection(db);
                resolve(result);
            });
        });
    });
}

exports.validateUserExists = function (username, users) {
    return users.filter(function (object) {
        return object.username == username;
    });
}

exports.fetchUsers = function () {
    return new Promise(function (resolve, reject) {
        var object;
        MongoClient.connect(getConnectionString()).then(function (db) {
            var collection = db.collection('users');
            collection.find().toArray(function (err, results) {
                closeConnection(db);
                resolve(results);
            });
        });
    });
}

exports.validateLogin = function (username, password, users) {
    var hasUser = exports.validateUserExists(username, users).length != 0;
    if (hasUser) {
        var responseArray = users.filter(function (object) {
            return object.username == username && object.password == password;
        });
        return responseArray.length != 0;
    } else {
        return false;
    }
}

exports.registerUser = function (user) {
    MongoClient.connect(getConnectionString(), function (err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var collection = db.collection('users');
        collection.insertOne(user, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Inserted user into users');
            }
            db.close();
        });
    });
}

exports.persist = function (video) {
    console.log(getConnectionString());
    prepareThumbnail('public/appvideos/' + video.fileName);
    MongoClient.connect(getConnectionString(), function (err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var collection = db.collection('videos');
        collection.insertOne(video, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Inserted entry into the "videos" collection');
            }
            db.close();
        });
    });
}

exports.find = function (keyword) {
    return new Promise(function (resolve, reject) {
        var object;
        MongoClient.connect(getConnectionString()).then(function (db) {
            var collection = db.collection('videos');
            collection.find({
                "videoName": {
                    "$regex": keyword
                }
            }).toArray(function (err, results) {
                console.log(results); // output all records
                closeConnection(db);
                resolve(results);
            });
        });
    });
}

exports.listHot = function (keyword) {
    return new Promise(function (resolve, reject) {
        var object;
        MongoClient.connect(getConnectionString()).then(function (db) {
            var collection = db.collection('videos');
            collection.find().sort({ views: -1 }).limit(5).toArray(function (err, results) {
                closeConnection(db);
                resolve(results);
            });
        });
    });
}

exports.listNew = function (keyword) {
    return new Promise(function (resolve, reject) {
        var object;
        MongoClient.connect(getConnectionString()).then(function (db) {
            var collection = db.collection('videos');
            collection.find().sort({ date: -1 }).limit(5).toArray(function (err, results) {
                closeConnection(db);
                resolve(results);
            });
        });
    });
}

exports.incrementView = function (video) {
    MongoClient.connect(getConnectionString(), function (err, db) {
        if (err) {
            console.log(err);
            return;
        }
        var collection = db.collection('videos');
        video.views = parseInt(video.views) + 1;
        collection.update({ _id: new ObjectId(video._id) }, video, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Updated ID: ' + video._id + ' with View: ' + video.views);
            }
            db.close();
        });
    });
}

exports.getFolderContents = function () {
    const testFolder = './public/appVideos/thumbnails';
    var files = [];
    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {
            files.push(file);
        });
    })
}