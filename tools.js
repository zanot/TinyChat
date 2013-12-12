var fs = require('fs');

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
	},

	generate: function (tpl_path, callback) {
		fs.readFile(tpl_path, 'utf8', function (error, tpl) {
			if (error) { throw error; }

			callback(tpl);
		});
	}
};