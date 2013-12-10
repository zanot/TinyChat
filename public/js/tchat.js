var socket = io.connect(); // ('//localhost:8080');
var btnSend = document.getElementById('envoyer');
var pseudo = '';


var updateHistory = function (data) {
	var historique = document.getElementById('historique');
	historique.innerHTML = data + historique.innerHTML;
};
var updateUsers = function (data) {
	var users = document.getElementById('users-list');
	users.innerHTML += data;
};
var refreshUsers = function (data) {
	var users = document.getElementById('users-list');
	users.innerHTML = data;
};


var buildItemUser = function (user) {
	return '<div class="user">' + user + '</div>';
};
var buildInfoConnect = function (when, who) {
	return '' +
	'<div class="information">' +
		'['+ when + '] ' + who + ' vient de se connecter.' +
	'</div>';
};
var buildInfoDisconnect = function (when, who) {
	return '' +
	'<div class="information">' +
		'['+ when + '] ' + who + ' vient de se déconnecter.' +
	'</div>';
};
var buildMessageLine = function (who, text) {
	return '' +
	'<div class="message">' +
		'<div class="username">' + who + '</div>' +
		'<div class="text">' + text +'</div>' +
	'</div>';
};


/**
 * DOM Events
 */
btnSend.onclick = function () {
	var message = document.getElementById('message').value;

	if (message !== '') {
		socket.emit('new-message', message);
	}
};


/**
 * Récupération du pseudo
 */
// pseudo = 'John Doe';
while (pseudo === '') {
	pseudo = prompt('Quel est votre pseudo ?');
}
if (pseudo === null) {
	document.body.innerHTML = 'Pas le droit d\'accéder au tchat.';
} else {
	socket.emit('new-connection', pseudo);
}


/**
 * Affichage de la connexion d'un nouvel utilisateur
 * aux utilisateurs déjà connectés
 */
socket.on('new-user-connected', function (userInfo) {
	var html = buildItemUser(userInfo.who);

	updateUsers(html);

	html = buildInfoConnect(userInfo.when, userInfo.who);
	updateHistory(html);
});


/**
 * Quand un utilisateur se connecte :
 * Réception de tous les utilisateurs connectés
 */
socket.on('get-users', function (users) {
	var html = '';

	for (var socketId in users) {
		html += buildItemUser(users[ socketId ]);
	}

	updateUsers(html);
});
/**
 * Quand un utilisateur se connecte :
 * Réception de l'historique du tchat
 */
socket.on('get-history', function (history) {
	var html  = '',
		entry = null;


	for (var i = history.length - 1; i >= 0; i--) {
		
		entry = history[ i ];

		switch (entry.type) {
			case 'info':
				html += buildInfoConnect(entry.data.when, entry.data.who);
				break;

			case 'message':
				html += buildMessageLine(entry.data.who, entry.data.txt);
				break;

			default: break;
		}
	}

	updateHistory(html);
});


/**
 * À la réception de nouveaux messages
 * de la part du serveur
 */
socket.on('new-message-posted', function (messageInfo) {
	var html = buildMessageLine(messageInfo.who, messageInfo.txt);

	updateHistory(html);
});


/**
 * Rafraîchissement de la liste des utilisateurs
 */
socket.on('refresh-users', function (users) {
	var html = '';

	for (var socketId in users) {
		html += buildItemUser(users[ socketId ]);
	}

	refreshUsers(html);
});


/**
 * À la déconnexion d'un nouvel utilisateur
 */
socket.on('user-disconnected', function (disconnectInfo) {
	var html = buildInfoDisconnect(disconnectInfo.when, disconnectInfo.who);

	updateHistory(html);
});