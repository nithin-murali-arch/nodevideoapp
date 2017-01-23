'use strict';
var http = require('http');
var utility = require('./utilities');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var session = require('express-session');
var path = require("path");
var fs = require("fs");
var app = express();
var event = require('events');
var multerUpload = multer({
	storage: multer.diskStorage({
		destination: './public/appvideos/',
		onFileUploadStart: function (file) {
			console.log('Starting file upload process.');
			if (file.mimetype !== 'video/mp4') {
				event.emit('multerEvent', 'Error: Mime type to be video/mp4 only!');
				return false;
			}
			else if(!req.session.user){
				event.emit('multerEvent', 'Error: Please login before you do that!');
			}
			else{
				event.emit('multerEvent', 'Success!');
			}
		},
		inMemory: true,
		filename: function (req, file, callback) {
			callback(null, file.fieldname + '-' + Date.now());
		}
	})
}).single('videoFile');
//TODO remove once we use S3
utility.refreshDBOnStart();
app.use(bodyParser.json());
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'i4M4H4CK3R'
}));
var users = [];
var loggedInUsers = new Set();
users.push({ 'username': 'Nithin', 'password': 'Nithin' });

utility.fetchUsers().then(function (userarray) {
	users = users.concat(userarray);
});

app.use('/', express.static('public'));

app.post('/login', function (req, res) {
	var loggedIn = utility.validateLogin(req.body.username, req.body.password, users);
	if (loggedIn || req.session.user) {
		var usr = req.body.username ? req.body.username : req.session.user;
		res.send('{"message": "Logged in!"}');
		loggedInUsers.add(usr, new Date());
	}
	else {
		res.send('{"errorMessage": "Error: Invalid authentication"}');
	}
});

app.get('/usersList', function (req, res) {
	res.send(users);
});

app.post('/register', function (req, res) {
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

app.get('/playVideo/:id', function (req, res) {
	utility.fetchFromDB(req.params.id).then(function (video) {
		res.contentType("video/mp4");
		var path = "./public/appvideos/"+ video.fileName;
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

app.get('/videoMetadata/:id', function(req, res){
	utility.fetchFromDB(req.params.id).then(function(video){
		res.end(JSON.stringify(video));
	});
});

app.post('/addVideo', multerUpload, function (req, res) {
	var message;
	event.on('multerEvent', function(evt, data){
		res.send(JSON.stringify(data));
	});
	req.body.fileName = req.file.filename;
	req.body.date = new Date();
	utility.persist(req.body);
	console.log(JSON.stringify(req.body));
});

app.get('/findVideo/:keyword', function (req, res) {
	utility.find(req.params.keyword).then(function (items) {
		res.send(items);
	});
});

app.get('/refresh', function (req, res) {
	utility.refreshDBOnStart();
});

app.get('/listHome', function (req, res) {
	var resp = {};
	utility.listHot(req.params.keyword).then(function (items) {
		resp.hot = items;
		if (resp.new !== undefined) {
			res.send(resp);
		}
	});
	utility.listNew(req.params.keyword).then(function (items) {
		resp.new = items;
		if (resp.hot !== undefined) {
			res.send(resp);
		}
	});
});

app.get('/getFiles', function(req, res){
	res.send(JSON.stringify(utility.getFolderContents));
});

app.listen(process.env.PORT || 1337);
