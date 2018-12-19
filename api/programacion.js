const path = require('path');
const sander = require('sander');
const server = require('../src/server');
var filePath = name => path.join(process.cwd(), name);
const reload = require('require-reload')(require);
const dJSON = require('dirty-json');
module.exports = app => {
	app.get('/api/programacion/fetch', (req, res) => {
		var data = sander.readFileSync(server.git.gitFilePath('config/data.js')).toString('utf-8')
		data = dJSON.parse(data);
		res.json({
			result: data.context.programacion
		})
	});
	app.post('/api/programacion/save', (req, res) => {
		var data = sander.readFileSync(server.git.gitFilePath('config/data.js')).toString('utf-8')
		data = dJSON.parse(data);
		data.context.programacion = req.body;
		server.git.pushPath('config/data.js', {
			files: [{
				path: 'config/data.js',
				contents: JSON.stringify(data, null, 4)
			}]
		});
		res.json({
			result: true
		})
	});
}