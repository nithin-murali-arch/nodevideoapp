'use strict';
var http = require('http');
var utility = require('./utilities');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var multerUpload = Multer({
		storage: Multer.diskStorage({
    		dest: './public/appvideos/',
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
}).single('video');

app.use(bodyParser.json());
var users = [];
var loggedInUsers = [];
users.push({'username': 'Nithin', 'password': 'Nithin'});
app.use('/', express.static('public'));

app.post('/login', function(req, res){
	var loggedIn = utility.validateLogin(req.body.username, req.body.password);
	if(loggedIn){
		res.send('{"message": "Logged in!"}');
		loggedInUsers.push(req.body.username, new Date());
	}
	else{
		res.send('{"message": "Error: Invalid authentication"}');
	}
});

app.get('/usersList', function(req, res){
	res.send(users);
});

app.post('/register', function(req, res){
	var result = utility.validateUserExists(req.body.username);
	if(result.length === 0){
		users.push({'username': req.body.username, 'password': req.body.password});
		res.send('{"message": "User created successfully!"}');
	}
	else{
		res.send('{"message": "Error: Username already exists!"}');
	}
});

app.get('/playVideo/:id', function(req, res){
	res.sendfile(utility.fetchFromDB(req.params.id));
});

app.post('/addVideo', multerUpload, function(req, res){
	req.body.video.fileName = req.file.fileName;
	utility.persist(req.body.video);
	res.send('Success!');
});

app.get('/findVideo/:keyword', function(req, res){
	utility.find(req.params.keyword).then(function(items){
		res.send(items);
	});
});

app.listen(1337);