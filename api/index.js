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

	app.get('/api/config', async(req, res) => {
		let config = reload('../config')
		await config.init()
		res.json({
			config
		})
	})
	app.get('/api/version', async (req, res) => {
		var packageJson = JSON.parse((await sander.readFile(filePath('package.json'))).toString('utf-8'));
		res.json({
			version: packageJson.version
		});
	});
	app.get('/api/login/validate', async(req, res) => {
		let config = reload('../config')
		await config.init()
		var code = config.login.code
		return res.json({
			result: code == req.query.code
		});
	})


	app.get('/api/config/fetch', async(req, res) => {
		res.json({
			result: (await sander.readFile(path.join(process.cwd(),'config/data.js'))).toString('utf-8')
		})
	})
	app.get('/api/locales/fetch', async (req, res) => {

		res.json({
			result: (await sander.readFile(path.join(process.cwd(),'config/locales.js'))).toString('utf-8')
		})
	})

	app.post('/api/advanced/:type/save',async (req,res)=>{
		await sander.writeFile(path.join(process.cwd(),req.body.path),req.body.contents)
		res.json({
			result:true
		})
	})




};