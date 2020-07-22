const path = require('path');
const moment = require('moment-timezone');
const sander = require('sander');
const server = require('../src/server');
var filePath = name => path.join(process.cwd(), name);
const reload = require('require-reload')(require);
const dJSON = require('dirty-json');
module.exports = app => {

	app.get('/api/formularioContacto/fetch', async (req, res) => {
		var data = (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8')
		data = dJSON.parse(data);
		res.json({
			result: data.context.formularioContacto
		})
	})

	app.post('/api/contacts/remove', async (req, res) => {
		var data = (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8')
		data = dJSON.parse(data);
		data.context = data.context || {};
		data.context.formularioContacto = data.context.formularioContacto || [];
		let _index = 0;
		if(data.context.formularioContacto.find((v, index) => {
			_index = index 
			return v.email == req.body.email
		})){
			data.context.formularioContacto.splice(_index,1)
			await sander.writeFile(path.join(process.cwd(),'config/data.js'),JSON.stringify(data, null, 4))
		}
		res.json({
			result: true
		})
	});

	app.post('/api/formularioContacto/save', async (req, res) => {
		var data = (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8');
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
			delete payload.name;
			if (item) {
				//server.helpers.deepMerge(item, payload);
				item.name = req.body.name;
				item.messages = item.messages || []
				item.messages.push(payload)
			} else {
				data.context.formularioContacto.push({
					name: req.body.name,
					email: req.body.email,
					messages: [payload]
				});
			}

			console.log(data)

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