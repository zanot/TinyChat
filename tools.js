
/**
 * Fonctions utiles
 */

module.exports = {
	log: function (txt) {
		console.log('[LOG] - ' + txt);
	},

	getDate: function () {
		var d = new Date();
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
	}
};