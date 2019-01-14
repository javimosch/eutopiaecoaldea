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

		try {
			var localPath = path.join(process.cwd(), 'config/data.js');
			var data = sander.readFileSync(localPath).toString('utf-8')
			data = dJSON.parse(data);
			data.context.programacion = req.body;
			var dataToWrite = JSON.stringify(data, null, 4)
			sander.writeFileSync(localPath, dataToWrite);
		} catch (err) {
			console.error('WHILE SAVING LOCAL DATA', err.stack);
		}

		server.git.pushPath('config/data.js', {
			files: [{
				path: 'config/data.js',
				contents: dataToWrite
			}]
		});
		res.json({
			result: true
		})
	});
}