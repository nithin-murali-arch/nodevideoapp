var fs = require('fs');
var db = require('./db');
var MongoClient = require('mongodb').MongoClient;
var ffmpeg = require('fluent-ffmpeg');
var ObjectId = require('mongodb').ObjectID;
var _DEFAULTS = {
    connTimeout: 1000, //millis
    videos: 'public/appvideos/',
    thumbnails: './public/thumbnails',
    tpath: 'thumbnails',
    videos: 'videos',
    users: 'users',
    thumbnail_limit: 10
};

var prepareThumbnail = function (videoPath, fileName) {
    var proc = new ffmpeg(videoPath + '/' + fileName).takeScreenshots({
        count: 1,
        filename: fileName + '.jpg',
        size: '320x240',
        timeout: 30
    }, _DEFAULTS.thumbnails, function (err) {
        console.log('Thumbnail saved.');
        if (err) {
            console.log(err);
        }
    });
    proc.setFfmpegPath('ffmpeg/ffmpeg');
    proc.setFfprobePath('ffmpeg/ffprobe');
};

exports.fetchVideo = function (id) {
    var criteria = { "_id": new ObjectId(id) };
    db.getOne(_DEFAULTS.videos, criteria).then(function (video) {
        return video;
    });
};

exports.validateUserExists = function (username, users) {
    return users.filter(function (object) {
        return object.username == username;
    });
};

exports.fetchUsers = function () {
    return db.get(_DEFAULTS.users).then(function (users) {
        return users;
    });
};

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
};

exports.registerUser = function (user) {
    db.add(_DEFAULTS.users, user);
};

exports.persist = function (video) {
    prepareThumbnail('appvideos', video.fileName);
    video.thumbnail = _DEFAULTS.tpath + '/' + video.fileName + '.jpg';
    db.add(_DEFAULTS.videos, video);
};

exports.find = function (keyword) {
    var search = {
        "$or": [
            { "videoName": { "$regex": keyword } },
            { "videoDesc": { "$regex": keyword } }]
    };
    return db.get(_DEFAULTS.videos, search).then(function(videos){
        return videos;
    });
};

exports.listHot = function (keyword) {
    var sort = { views: -1 };
    return db.get(_DEFAULTS.videos, null, sort, _DEFAULTS.thumbnail_limit).then(function(videos){
        return videos;
    });
};

exports.listNew = function (keyword) {
    var sort = { date: -1 };
    return db.get(_DEFAULTS.videos, null, sort, _DEFAULTS.thumbnail_limit).then(function(videos){
        return videos;
    });
};

exports.incrementView = function (video) {
    video.views = parseInt(video.views) + 1;
    db.update(_DEFAULTS.videos, { _id: new ObjectId(video._id) }, video);
};

exports.getFolderContents = function () {
    const testFolder = _DEFAULTS.thumbnails;
    return fs.readdir(testFolder, (err, files) => {
        return files;
    })
}

exports.rmDir = function (dirPath) {
    var files;
    try {
        files = fs.readdirSync(dirPath);
    }
    catch (e) {
        console.log(e);
        return;
    }
    if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
            else {
                rmDir(filePath);
            }
        }
    }
};

exports.refreshDBOnStart = function () {
    db.refreshDB();
}
