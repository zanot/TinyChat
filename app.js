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
	socket.on('new-connection', function (userPseudo) {

		var connectionInfos = {
			when: tools.getDate(),
			who : userPseudo
		};


		socket.set('pseudo', userPseudo);


		// Hash <socket id/user pseudo>
		users[ socket.id ] = userPseudo;

		historique.push({
			type: 'info',
			data: connectionInfos
		});


		// Send to current request socket client
		socket.emit('get-users', users);
		socket.emit('get-history', historique);
		// Send to all clients, except sender
		socket.broadcast.emit('new-user-connected', connectionInfos);


		tools.log(userPseudo + ' vient de se connecter.');
	});


	// When new message arrive
	socket.on('new-message', function (userMessage) {

		// Find who send it
		socket.get('pseudo', function (error, userPseudo) {

			var messageInfo = {
				who: userPseudo,
				txt: userMessage
			};


			historique.push({
				type: 'message',
				data: messageInfo
			});


			// Send to all clients, include sender
			io.sockets.emit('new-message-posted', messageInfo);
		});
	});


	// When a user is disconnecting
	socket.on('disconnect', function () {

		// On supprime l'utilisateur de la liste des utilisateurs
		delete users[ socket.id ];

		socket.get('pseudo', function (error, userPseudo) {

			if (userPseudo !== null) {

				var disconnectInfo = {
					when: tools.getDate(),
					who : userPseudo
				};

				// Send to all clients, except sender
				socket.broadcast.emit('refresh-users', users);
				socket.broadcast.emit('user-disconnected', disconnectInfo);
			}
		});
	});
});