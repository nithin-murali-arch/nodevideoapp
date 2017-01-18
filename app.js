'use strict';
var http = require('http');
var utility = require('./utilities');
var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var session = require('express-session');
var fs = require("fs");
var app = express();
var multerUpload = multer({
		storage: multer.diskStorage({
    		destination: './public/appvideos/',
			onFileUploadStart: function(file) {
        		console.log('Starting file upload process.');
        		if(file.mimetype !== 'video/mp4') {
            		return false;
        		}
    		},
			inMemory: true,
    		filename: function (req, file, callback) { 
				callback(null, file.fieldname + '-' + Date.now());
			}
		})
}).single('videoFile');

app.use(bodyParser.json());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'i4M4H4CK3R'
}));
var users = [];
var loggedInUsers = new Set();
users.push({'username': 'Nithin', 'password': 'Nithin'});

utility.fetchUsers().then(function(userarray){
	users = users.concat(userarray);
});

app.use('/', express.static('public'));

app.post('/login', function(req, res){
	var loggedIn = utility.validateLogin(req.body.username, req.body.password, users);
	if(loggedIn || req.session.user){
		var usr = req.body.username ? req.body.username : req.session.user;
		res.send('{"message": "Logged in!"}');
		loggedInUsers.add(usr , new Date());
	}
	else{
		res.send('{"errorMessage": "Error: Invalid authentication"}');
	}
});

app.get('/usersList', function(req, res){
	res.send(users);
});

app.post('/register', function(req, res){
	var result = utility.validateUserExists(req.body.username, users);
	if(result.length === 0){
		var userObj = {'username': req.body.username, 'password': req.body.password};
		users.push(userObj);
		utility.registerUser(userObj);
		res.send('{"message": "User created successfully!"}');
	}
	else{
		res.send('{"errorMessage": "Error: Username already exists!"}');
	}
});

app.get('/playVideo/:id', function(req, res){
	utility.fetchFromDB(req.params.id).then(function(video){
		res.contentType("video/mp4");
	if (req.url === ("/playVideo/" + req.params.id)) {
			utility.incrementView(video);
			res.contentType("text/html");
			res.end('<video src="playVideo/' + req.params.id +'" controls></video>');
  		}
		var range = req.headers.range;
      	if (!range) {
       		res.sendStatus(416);
      	}
		var positions = range.replace(/bytes=/, "").split("-");
      	var start = parseInt(positions[0], 10);
      	var total = stats.size;
      	var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      	var chunksize = (end - start) + 1;
		var file = path.resolve("./public/appvideos/",video.fileName);
		fs.stat(file, function(err, stats) {
			var total = stats.size;
      		var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      		var chunksize = (end - start) + 1;
		    res.writeHead(206, {
        		"Content-Range": "bytes " + start + "-" + end + "/" + total,
        		"Accept-Ranges": "bytes",
        		"Content-Length": chunksize,
        		"Content-Type": "video/mp4"
      		});
			var stream = fs.createReadStream(file, { start: start, end: end }).on("open", function() {
				stream.pipe(res);
			}).on("error", function(err) {
				res.end(err);
			});
		});
	});
});

app.post('/addVideo', multerUpload, function(req, res){
	req.body.fileName = req.file.filename;
	req.body.date = new Date();
	utility.persist(req.body);
	console.log(JSON.stringify(req.body));
	res.send('Success!');
});

app.get('/findVideo/:keyword', function(req, res){
	utility.find(req.params.keyword).then(function(items){
		res.send(items);
	});
});

app.get('/listHome', function(req, res){
	var resp = {};
	utility.listHot(req.params.keyword).then(function(items){
		resp.hot = items;
		if(resp.new !== undefined){
			res.send(resp);
		}
	});
	utility.listNew(req.params.keyword).then(function(items){
		resp.new = items;
		if(resp.hot !== undefined){
			res.send(resp);
		}
	});
});

app.listen(process.env.PORT || 1337);