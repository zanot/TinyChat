var fs = require('fs');
var ejs = require('ejs');
var viewsPath = __dirname + '/views/';


module.exports = {

	log: function (txt) {
		console.log('[LOG] - ' + txt);
	},

	/**
	 * Retourne le jour et l'heure courant
	 * @return {string} Ex: Thurday, December 12, 2013_21:22:31
	 */
	getDate: function () {
		var d = new Date();
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
	},

	/**
	 * Génère un template et exécute un callback avec l'HTML généré
	 * @param  {string}   tpl_path Chemin du template à générer
	 * @param  {object}   tpl_data Données du template
	 * @param  {Function} callback Actions à effectuer avec l'HTML généré
	 */
	generate: function (tpl_path, tpl_data, callback) {

		fs.readFile(viewsPath + tpl_path, 'utf8', function (error, tpl) {

			if (error) { throw error; }

			var html = ejs.render(tpl, tpl_data);

			callback(html);
		});
	}
};