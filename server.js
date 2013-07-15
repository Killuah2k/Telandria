// // // // // // // // // // VARIABLEN // // // // // // // // //

var io = require('socket.io');
var express = require('express');
var app = express();

var http = require('http').createServer(app);
var io = require('socket.io').listen(http);

var MySQLSessionStore = require('connect-mysql-session')(express);
var MySQL = require('mysql');
var mysqlclient = MySQL.createConnection({
	host: 'localhost',
	user: 'telandriaServer',
	password: 'p2405S88'
}); 

// // // // // // // // // // OPTIONEN // // // // // // // // // //

// Disable "unneccessary" console.log
//console.log = function() {}

// // // // // // // // // // AUSFÜHRUNG // // // // // // // // //

// Server initalisieren und starten
var server = new GameServer(4003, true, 'telandria');

// // // // // // // // // // KLASSEN // // // // // // // // // //

// GameServer-Oberklasse
function GameServer(port, debug, database) {
	this.port = port;	
	this.debug = debug;
	
	console.log('\t :: Server :: start Server');
	console.log('\t :: Server :: is Debug active? ' + this.debug);
	
	// bestimmte Datenbank verwenden
	mysqlclient.query('USE '+ database);
	
	// Server starten
	http.listen(this.port);
	console.log('\t :: Server :: Server started on Port ' + this.port);
}

GameServer.prototype.addUser = function(data, callback) {
	mysqlclient.query(
		'INSERT INTO user (name, email, password) VALUES (?, ?, ?)', 
		[data.name, data.mail, data.password],
		function (err, info) {
			callback(info.insertId);
	});
}

GameServer.prototype.getUsers = function(callback) {
	mysqlclient.query(
		'SELECT * FROM user',
		function(err, results) {
			callback(results);
	});
}

GameServer.prototype.userLogin = function(data, callback) {
	mysqlclient.query(
		'SELECT * FROM user WHERE name = ? AND password = ?',
		[data.name, data.password],
		function(err, results) {
			callback(results);
	});
}

// // // // // // // // // // FUNKTIONEN // // // // // // // // // //

io.sockets.on('connection', function(client) {
	console.log('Client connected');
	//server.getUsers(function(users) {
	//	client.emit('populate', users);
	//});
	
	client.on('userlogin', function(data) {
		server.userLogin(data, function(results) {
			express.session.userInfo = results[0];
			express.session.is_logged_in = true;
			var userdata = {
				userInfo: express.session.userInfo,
				is_logged_in: express.session.is_logged_in
			}
			client.emit('is_logged_in', userdata);
		});
	});
	
	client.on('add user', function(data) {
		server.addUser(data, function() {});
	});
});

// Konfiguration für "nodewebserver"
app.configure(function() {
	app.use(express.favicon());
	app.use(express.cookieParser());
	app.use(express.session({
		store: new MySQLSessionStore('Telandria', 'telandriaServer', 'p2405S88', {}),
		secret: 'keyboard cat'
	}));		
});

// auf Login reagieren
//app.post('/login', function(req, res) {
//	client.query(
//		'SELECT id, name, email FROM user WHERE name=? AND password=?', 
//		[req.body.login, Hash.sha1(req.body.password)],
//		function(err, results, fields) {
//			if (err)
//				throw err;
//				
//			if (results[0]) {
//				req.session.userInfo = results[0];
//				req.session.is_logged_in = true;
//				res.redirect('/telandria');
//			} else
//				res.redirect('/');				
//	});
//});

// "Home" aufgerufen
app.get('/', function(req, res) {
	res.sendfile( __dirname + '/index.html' );
});

// für Scripte etc alles "richtig" weiterleiten
app.get('/*' , function(req, res, next) {
	res.sendfile( __dirname + '/' + req.params[0] );
});