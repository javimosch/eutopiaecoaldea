const path = require('path');
const sander = require('sander');
var filePath = name => path.join(process.cwd(), name);

module.exports = function configure(app){
	app.get('/api/version',(req,res)=>{
		var package = JSON.parse(sander.readFileSync(filePath('package.json')).toString('utf-8'));
		res.json({
			version: package.version
		});
	});
};