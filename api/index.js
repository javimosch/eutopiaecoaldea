const path = require('path');
const sander = require('sander');
const server = require('../src/server');
var filePath = name => path.join(process.cwd(), name);
const reload = require('require-reload')(require);
const dJSON = require('dirty-json');
const logger = server.helpers.getLogger('API-INDEX')
module.exports = function configure(app) {

	app.use((req,res,next)=>{
		if(req.path.indexOf('/api')!==-1){
			logger.debug(`${req.method.toUpperCase()} ${req.url}`)
		}
		next();
	})

	require('./upload')(app);
	require('./images')(app);
	require('./files')(app);
	require('./email')(app);
	require('./voluntariado')(app);
	require('./contactForm')(app);
	require('./programacion')(app);
	require('./pages')(app);
	require('./partials')(app);
	require('./styles')(app);

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

	app.get('/api/deployment/publish', async (req, res) => {
		try {
			await server.git.deploy();
			res.json({
				result:true
			});
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
		var packageJson = JSON.parse(sander.readFileSync(filePath('package.json')).toString('utf-8'));
		res.json({
			version: packageJson.version
		});
	});
	app.get('/api/login/validate', (req, res) => {
		var code = reload('../config').login.code
		logger.debug("validate",{
			expected:code,
			received:req.query.code
		})
		return res.json({
			result: code == req.query.code
		});
	})


	app.get('/api/config/fetch', (req, res) => {
		res.json({
			result: sander.readFileSync(path.join(process.cwd(),'config/data.js')).toString('utf-8')
		})
	})
	app.get('/api/locales/fetch', (req, res) => {

		res.json({
			result: sander.readFileSync(path.join(process.cwd(),'config/locales.js')).toString('utf-8')
		})
	})

	app.post('/api/advanced/:type/save',async (req,res)=>{
		await sander.writeFile(path.join(process.cwd(),req.body.path),req.body.contents)
		res.json({
			result:true
		})
	})




};