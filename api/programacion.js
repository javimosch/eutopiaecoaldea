const path = require('path');
const sander = require('sander');
const dJSON = require('dirty-json');
module.exports = app => {
	
	app.get('/api/programacion/fetch', async(req, res) => {
		var data = (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8')
		data = dJSON.parse(data);
		res.json({
			result: data.context.programacion
		})
	});

	app.get('/api/programacion/remove', async(req, res) => {
		var data = (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8')
		data = dJSON.parse(data);
		res.json({
			result: data.context.programacion
		})
	});

	app.post('/api/programacion/save', async(req, res) => {
		try {
			var dataPath = path.join(process.cwd(), 'config/data.js');
			var data = (await sander.readFile(dataPath)).toString('utf-8')
			data = dJSON.parse(data);
			data.context.programacion = req.body;
			await sander.writeFile(dataPath,JSON.stringify(data, null, 4))
		} catch (err) {
			console.error('WHILE SAVING LOCAL DATA', err.stack);
			res.status(500).send()
		}
		res.json({
			result: true
		})
	});
}