const path = require('path');
const sander = require('sander');
const server = require('../src/server');
var filePath = name => path.join(process.cwd(), name);
const reload = require('require-reload')(require);

module.exports = function configure(app) {

	require('./upload')(app);
	require('./images')(app);
	require('./email')(app);

	app.post('/api/git/path', (req, res) => {
		var gitPath = server.git.getPath();
		console.log('API', req.url, {
			body: req.body
		})
		if (!req.body.path) return res.status(400).send();
		try {

			server.git.pushPath(req.body.path, {
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

	app.get('/api/deployment/publish', (req, res) => {
		var shortid = require('shortid');
		var updateCode = shortid.generate();
		var data = sander.readFileSync(server.git.gitFilePath('config/data.js')).toString('utf-8');
		const dJSON = require('dirty-json');
		try {
			data = dJSON.parse(data);
			data.context = data.context || {}
			data.context.updateCode = updateCode;
			data.wipMode = req.query.wipMode === '1' ? true : false;
			server.git.pushPath('config/data.js', {
				files: [{
					path: 'config/data.js',
					contents: JSON.stringify(data, null, 4)
				}]
			});
			res.json({
				result: true,
				updateCode: updateCode
			});
			if (data.wipMode) {
				server.git.deploy({
					branches: ['master']
				});
			} else {
				if (req.query.staging === '1') {
					server.git.deploy({
						branches: ['heroku']
					});
				} else {
					server.git.deployAll();
				}
			}
		} catch (err) {
			console.error(err.stack);
			return res.status(500).send();
		}

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
			result: sander.readFileSync(server.git.gitFilePath('config/data.js')).toString('utf-8')
		})
	})
	app.get('/api/locales/fetch', (req, res) => {
		
		res.json({
			result: sander.readFileSync(server.git.gitFilePath('config/locales.js')).toString('utf-8')
		})
	})

};