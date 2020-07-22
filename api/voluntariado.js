const path = require('path');
const dJSON = require('dirty-json');
const sander = require('sander');
const server = require('../src/server');
const moment = require('moment-timezone');

module.exports = app => {

	app.get('/api/voluntarios/fetch', async (req, res) => {
		var data = (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8')
		data = dJSON.parse(data);
		res.json({
			result: data.context.voluntarios
		})
	})

	app.post('/api/voluntarios/remove', async (req, res) => {
		var data = (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8')
		data = dJSON.parse(data);
		data.context = data.context || {};
		data.context.voluntarios = data.context.voluntarios || [];
		let _index = 0;
		if(data.context.voluntarios.find((v,index) => {
			_index = index
			return v.email == req.body.email
		})){
			data.context.voluntarios.splice(_index,1)
			await sander.writeFile(path.join(process.cwd(),'config/data.js'),JSON.stringify(data, null, 4))
		}
		res.json({
			result: true
		})
	})

	app.post('/api/voluntariado/save', async(req, res) => {
		var dataPath = path.join(process.cwd(),'config/data.js')
		var data = (await sander.readFile(dataPath)).toString('utf-8');
		const dJSON = require('dirty-json');
		if (!req.body.name || !req.body.email) {
			return res.status(400).send('Nombre y Email requerido');
		}
		try {
			data = dJSON.parse(data);
			data.context = data.context || {};
			data.context.voluntarios = data.context.voluntarios || [];
			var voluntario = data.context.voluntarios.find(v => v.email == req.body.email);
			var payload = Object.assign({}, req.body, {
				date: moment().tz('America/Guayaqui').format('DD-MM-YYYY HH:mm')
			})
			if (voluntario) {
				server.helpers.deepMerge(voluntario, payload);
			} else {
				data.context.voluntarios.push(payload);
			}

			await sander.writeFile(path.join(process.cwd(),'config/data.js'),JSON.stringify(data, null, 4))

			res.json({
				result: true
			});
		} catch (err) {
			console.error(err.stack);
			return res.status(500).send();
		}
	});
}