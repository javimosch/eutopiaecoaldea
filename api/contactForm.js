const path = require('path');
const moment = require('moment-timezone');
const sander = require('sander');
const server = require('../src/server');
var filePath = name => path.join(process.cwd(), name);
const reload = require('require-reload')(require);
module.exports = app => {
	app.post('/api/formulario-de-contacto/guardar', (req, res) => {
		var dataPath = server.git.gitFilePath('config/data.js')
		var data = sander.readFileSync(dataPath).toString('utf-8');
		const dJSON = require('dirty-json');
		if (!req.body.name || !req.body.email) {
			return res.status(400).send('Nombre y Email requerido');
		}
		try {
			data = dJSON.parse(data);
			data.context = data.context || {};
			data.context.formularioContacto = data.context.formularioContacto || [];
			var item = data.context.formularioContacto.find(v => v.email == req.body.email);
			var payload = Object.assign({},req.body,{
				date: moment().tz('America/Guayaqui').format('DD-MM-YYYY HH:mm')
			});
			delete payload.email;
			if (item) {
				//server.helpers.deepMerge(item, payload);
				item.messages = item.messages || []
				item.messages.push(payload)
			} else {
				data.context.formularioContacto.push({
					email: req.body.email,
					messages: [payload]
				});
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