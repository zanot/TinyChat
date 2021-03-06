var socket = io.connect(); // ('//localhost:8080');
var btnSend = document.getElementById('envoyer');
var username = '';


/**
 * Fonctions en lien avec l'historique du tchat
 */
var _history = {

	/**
	 * Parcourt des entrées d'historique
	 * @param  {Array} entries Tableau d'entrées de l'historique
	 */
	browse: function (entries) {
		var html  = '',
			entry = null;

		for (var i = entries.length - 1; i >= 0; i--) {
			entry = entries[ i ];
			html += entry.data;
		}

		_history.update(html);
	},

	/**
	 * Génère l'historique
	 * @param  {string} newHtml HTML à générer
	 */
	update: function (newHtml) {
		var h = document.getElementById('historique');
		h.innerHTML = newHtml + h.innerHTML;
	}
};

/**
 * Fonctions en lien avec les utilisateurs
 */
var users = {

	/**
	 * Affiche les utilisateurs connectés
	 * @param  {string} newHtml HTML à générer
	 */
	display: function (newHtml) {
		var users = document.getElementById('users-list');
		users.innerHTML = newHtml;
	},

	/**
	 * Met à jour les utilisateurs connectés
	 * @param  {string} newHtml HTML à injecter
	 */
	update: function (newHtml) {
		var users = document.getElementById('users-list');
		users.innerHTML += newHtml;
	}
};


// Envoi d'un message au serveur
var sendMessage = function () {
	var bloc = document.getElementById('message'),
		message = bloc.value;

	if (message !== '') {
		socket.emit('new-message', message);
		bloc.value = '';
		bloc.focus();
	}
};


/**
 * DOM Events
 */
btnSend.onclick = sendMessage;


/**
 * Récupération du nom de l'utilisateur
 */
// username = 'John Doe';
while (username === '') {
	username = prompt('Quel est votre pseudo ?');
}
if (username === null) {
	document.body.innerHTML = 'Pas le droit d\'accéder au tchat.';
} else {
	socket.emit('new-connection', username);
}


/**
 * Afficher la connexion d'un nouvel utilisateur à ceux déjà connectés
 */
socket.on('new-user-connected', function (info) {
	users.update(info.user);
	_history.update(info.connection);
});


/**
 * Quand un utilisateur se connecte : Réception de ceux déjà connectés
 */
socket.on('get-users', users.update);


/**
 * Quand un utilisateur se connecte : Réception de l'historique du tchat
 */
socket.on('get-history', _history.browse);


/**
 * À la réception de nouveaux messages de la part du serveur
 */
socket.on('new-message-posted', _history.update);


/**
 * Rafraîchissement de la liste des utilisateurs
 */
socket.on('refresh-users', users.display);


/**
 * À la déconnexion d'un nouvel utilisateur
 */
socket.on('user-disconnected', _history.update);