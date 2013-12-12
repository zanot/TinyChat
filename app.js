var express = require('express');
var routes = require('./routes');
var path = require('path');
var port = 8080;
var app = express();
var server = app.listen(port, function () {
	console.log('Listening on port : ' + port);
});


/**
 * EXPRESS
 */
app

	/**
	 * Express configuration
	 */

	.use(express.logger('dev'))

	// Informs Express where your template files are
	.set('views', path.join(__dirname, 'views'))
	// Which template engine to use
	.set('view engine', 'ejs')
	// Specifies the function that will process the template's code
	.engine('ejs', require('ejs').renderFile)

	// Use of an external JS file (will hold the front-end logic)
	// --> need to inform Express where to look for such resources
	.use(express.static(path.join(__dirname, 'public')))


	/**
	 * Routing
	 */
	.get('/', routes.index)


	/**
	 * Error 404
	 */
	.use( function (req, res, next) {
		res.setHeader('Content-Type', 'text/plain');
		res.send(404, 'Page introuvable !');
	})
;


/**
 * SOCKET.IO
 */
var io = require('socket.io').listen(server);
var tools = require('./tools');
var historique = [];
var users = {};


io.sockets.on('connection', function (socket) {

	// When a new user is connected
	socket.on('new-connection', function (username) {

		socket.set('username', username); // Stocke pseudo pour la session
		users[ socket.id ] = username;    // Colection <socket id/user pseudo>


		// Generate template "listing users"
		tools.generate('user/list_all.ejs', { users: users }, function (html) {
			// Send to current request socket client
			socket.emit('get-users', html);
		});


		// Generate template "Connection info"
		tools.generate('user/connect.ejs', {
			when: tools.getDate(),
			who : username
		}, function (htmlConnect) {
			
			historique.push({
				type: 'info',
				data: htmlConnect
			});

			// Send to current request socket client
			socket.emit('get-history', historique);


			// Generate template "current user info"
			tools.generate('user/list_one.ejs', { who: username }, function (htmlUser) {
				
				// Send to all clients, except sender
				socket.broadcast.emit('new-user-connected', {
					user: htmlUser,
					connection: htmlConnect
				});

			});
		});
	});


	// When new message arrive
	socket.on('new-message', function (message) {

		// Find who sent it
		socket.get('username', function (error, username) {

			// Generate template "message"
			tools.generate('message.ejs', { who: username, text: message }, function (html) {
				
				historique.push({
					type: 'message',
					data: html
				});

				// Send to all clients, include sender
				io.sockets.emit('new-message-posted', html);
			});
		});
	});


	// When a user is disconnecting
	socket.on('disconnect', function () {

		// On supprime l'utilisateur de la liste des utilisateurs
		delete users[ socket.id ];

		socket.get('username', function (error, username) {

			if (username !== null) {

				// Generate template "disconnect"
				tools.generate('user/disconnect.ejs', {
					when: tools.getDate(),
					who : username
				}, function (html) {
					
					historique.push({
						type: 'info',
						data: html
					});

					// Send to all clients, except sender
					socket.broadcast.emit('user-disconnected', html);
				});


				// Generate template "list all"
				tools.generate('user/list_all.ejs', { users: users }, function (html) {
					// Send to all clients, except sender
					socket.broadcast.emit('refresh-users', html);
				});
			}
		});
	});
});