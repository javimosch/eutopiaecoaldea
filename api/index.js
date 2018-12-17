const path = require('path');
const sander = require('sander');
const server = require('../src/server');
var filePath = name => path.join(process.cwd(), name);
const reload = require('require-reload')(require);

module.exports = function configure(app) {

	require('./upload')(app);
	require('./images')(app);
	require('./email')(app);

	app.post('/api/deploy/path', (req, res) => {
		var gitPath = server.git.getPath();
		console.log('API',req.url,{
				body:req.body
			})
		if (!req.body.path) return res.status(400).send();
		try {
			
			server.git.pushPath(req.body.path,{
				files: req.body.files
			});
			res.json({
				result: true
			});
		} catch (err) {
			console.error('API', req.url, err.stack);
			res.json({
				result: false
			});
		}

	});

	app.get('/api/deploy', (req, res) => {
		res.json({
			result: true
		});
		server.git.deploy();
	});

	app.get('/api/config', (req, res) => {
		res.json({
			config: reload('../config')
		})
	})
	app.get('/api/version', (req, res) => {
		var package = JSON.parse(sander.readFileSync(filePath('package.json')).toString('utf-8'));
		res.json({
			version: package.version
		});
	});
	app.get('/api/login/validate', (req, res) => {
		var code = reload('../config').login.code
		return res.json({
			result: code == req.query.code
		});
	})


	app.get('/api/config/fetch', (req, res) => {
		res.json({
			result: sander.readFileSync(filePath('config/data.js')).toString('utf-8')
		})
	})

};