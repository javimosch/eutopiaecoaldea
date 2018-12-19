const path = require('path');
const sander = require('sander');
const server = require('../src/server');
var filePath = name => path.join(process.cwd(), name);
const reload = require('require-reload')(require);
module.exports = app => {
	app.post('/api/voluntariado/save', (req, res) => {
		var dataPath = server.git.gitFilePath('config/data.js')
		var data = sander.readFileSync(dataPath).toString('utf-8');
		const dJSON = require('dirty-json');
		if (!req.body.name || !req.body.email) {
			return res.status(400).send('Nombre y Email requerido');
		}
		try {
			data = dJSON.parse(data);
			data.context = data.context || {};
			data.context.voluntarios = data.context.voluntarios || [];
			var voluntario = data.context.voluntarios.find(v => v.email == req.body.email);
			if (voluntario) {
				server.helpers.deepMerge(voluntario, req.body);
			} else {
				data.context.voluntarios.push(req.body);
			}
			server.git.pushPath('config/data.js', {
				files: [{
					path: 'config/data.js',
					contents: JSON.stringify(data, null, 4)
				}]
			});
			res.json({
				result: true
			});
		} catch (err) {
			console.error(err.stack);
			return res.status(500).send();
		}
	});
}