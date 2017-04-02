'use strict';

var utility = require('./utilities');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var session = require('express-session');
var path = require("path");
var fs = require("fs");
var constants = JSON.parse(fs.readFileSync('constants.json', 'utf8'));
var http = constants.isH2Application ? require('spdy') : require('http');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var passport = require('passport');
var crypto = require('crypto');
var FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
    clientID: constants.facebook_api_key,
    clientSecret: constants.facebook_api_secret,
    callbackURL: "http://nodevideoapp-nithinmurali.rhcloud.com/fboauthCallBack",
    passReqToCallback: true,
    profileFields: 'emails'
  },
  function(accessToken, refreshToken, profile, cb) {
      if(!utility.validateUserExists(profile.id)){
          utility.registerUser({'username': profile.id, 'password': crypto.createHash('md5').update(getRandomInt(0, 1000)).digest("hex")});
      }
    return cb(null, profile.id);
  }
));
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
 var oauth2Client = new OAuth2(
   constants.clientId,
   constants.clientSecret,
   constants.oauthCallBack
 );
 var scopes = ['https://www.googleapis.com/auth/plus.me'];
 var url = oauth2Client.generateAuthUrl({
 	access_type: 'offline',
 	scope: scopes,
 });
var event = require('./appevents');
var app = express();
var multerUpload = multer({
    storage: multer.diskStorage({
        destination: './public/appvideos/',
	fileFilter: function(req, file, cb){
		if(path.extname(file.originalname) !== '.mp4'){
			return cb(new Error('Only MP4 videos are allowed.'));
		}
		if(!req.session.user){
			return cb(new Error('Please log in first.'));
		}
	},
        inMemory: true,
        filename: function(req, file, callback) {
            callback(null, file.fieldname + '-' + Date.now());
        }
    })
}).single('videoFile');

var users = [];
var loggedInUsers = new Set();
event.eventObj.on('dbInitialized', function() {
    //TODO remove once we use S3
	if(process.env.PORT || 1337 !== 1337){
		utility.refreshDBOnStart();
	}
    users.push({ 'username': 'Nithin', 'password': 'Nithin' });
    users = users.concat(utility.fetchUsers());
});
app.use(bodyParser.json());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'i4M4H4CK3R'
}));
app.use('/', express.static('public'));

app.post('/login', function(req, res) {
    var loggedIn = utility.validateLogin(req.body.username, req.body.password, users);
    var usr = (req.body.username && loggedIn) ? req.body.username : req.user || req.session.user;
    if (usr) {
        res.send('{"message": "Logged in!"}');
        loggedInUsers.add(usr, new Date());
    }
    else {
        res.send('{"errorMessage": "Error: Invalid authentication"}');
    }
});

app.get('/usersList', function(req, res) {
    res.send(users);
});

app.post('/register', function(req, res) {
    var result = utility.validateUserExists(req.body.username, users);
    if (result.length === 0) {
        var userObj = { 'username': req.body.username, 'password': req.body.password };
        users.push(userObj);
        utility.registerUser(userObj);
        res.send('{"message": "User created successfully!"}');
    }
    else {
        res.send('{"errorMessage": "Error: Username already exists!"}');
    }
});

app.get('/playVideo/:id', function(req, res) {
    var video = utility.fetchVideo(req.params.id).then(function(video) {
        console.log(video);
        res.contentType("video/mp4");
        var path = "./public/appvideos/" + video.fileName;
        var stat = fs.statSync(path);
        var total = stat.size;
        if (req.headers['range']) {
            var range = req.headers.range;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];
            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total - 1;
            var chunksize = (end - start) + 1;
            console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
            var file = fs.createReadStream(path, { start: start, end: end });
            res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
            file.pipe(res);
        } else {
            console.log('ALL: ' + total);
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
            fs.createReadStream(path).pipe(res);
        }
    });

});

app.get('/videoMetadata/:id', function(req, res) {
    utility.fetchVideo(req.params.id).then(function(video){
        res.end(JSON.stringify(video));
    });
    
});

app.post('/addVideo', multerUpload, function(req, res) {

    console.log('not an error');
    req.body.fileName = req.file.filename;
    req.body.date = new Date();
    utility.persist(req.body);
    console.log(JSON.stringify(req.body));
    res.send("Success!");

});

app.get('/findVideo/:keyword', function(req, res) {
    res.send(utility.find(req.params.keyword));
});

app.get('/refresh', function(req, res) {
    utility.refreshDBOnStart();
});

app.get('/listHome', function(req, res) {
    var resp = {};
	resp.url = url;
	utility.listHot(req.params.keyword).then(function(hot) {
		resp.hot = hot;
        if (resp.new !== undefined) {
            res.send(resp);
        }
    });
    utility.listNew(req.params.keyword).then(function(newObj) {
        resp.new = newObj;
        if (resp.hot !== undefined) {
            res.send(resp);
        }
    }); 
});

app.get('/auth/facebook', passport.authenticate('facebook', {'scope' : ['email']}), function(req, res){});

app.get('/getFiles', function(req, res) {
    res.send(JSON.stringify(utility.getFolderContents));
});

app.get('/oauthCallBack', function(req, res) {
    utility.validateUserExists(req.body.username, users);
    res.end(JSON.stringify(req));
});

app.get('/fboauthCallBack', passport.authorize('facebook', {
            successRedirect : '/login',
            failureRedirect : '/'
        }));

if(constants.isH2Application) {
http.createServer({
    key: fs.readFileSync(__dirname + '/server.key'),
    cert: fs.readFileSync(__dirname + '/server.cert'),
      spdy: {
    protocols: [ 'h2', 'spdy'],
    plain: false, 
    ssl: true
  }
}, app, (err) => {
    if (err) {
        throw new Error(err);
    }
}).listen(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 1337, process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1', (error) => {
    console.log(error);
});
}
else {
    app.listen(process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 1337, process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
}