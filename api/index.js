const path = require('path');
const sander = require('sander');
const server = require('../src/server');
var filePath = name => path.join(process.cwd(), name);
const reload = require('require-reload')(require);

module.exports = function configure(app){
	app.get('/api/config',(req,res)=>{
		res.json({
			config: reload('../config')
		})
	})
	app.get('/api/version',(req,res)=>{
		var package = JSON.parse(sander.readFileSync(filePath('package.json')).toString('utf-8'));
		res.json({
			version: package.version
		});
	});
	app.get('/api/login/validate',(req,res)=>{
		return res.json({
			result: reload('../config').login.code == req.query.code
		});
	})
};