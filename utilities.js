var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var _DEFAULTS = {

};
var getConnectionString = function(){
	var secObj = JSON.parse(fs.readFileSync('dbauth.json', 'utf8'));
	return "mongo://" + secObj.dbUser + ":" + secObj.dbPass + "@" + secObj.host + ":" + secObj.port + "/" + secObj.database;
}

exports.fetchFromDB = function(id){
	return 'C:/Users/nithin.murali/Downloads/movie.mp4';
}

exports.validateUserExists = function(username){
	return users.filter(function( object ) {
  		return object.username == username;
	});
}

exports.validateLogin = function(username, password){
	var hasUser = validateUserExists(username).length != 0;
	if(hasUser){
		var responseArray = users.filter(function( object ) {
  			return object.username == username && object.password == password;
		});
		return responseArray.length != 0;
	}
	else{
		return false;
	}
}

exports.persist = function(){
	MongoClient.connect(getConnectionString(), function(err, db){
		if(err){
			console.log(err);
		}

	});
}