var server = require('../src/server');
var path = require('path');
var sander = require('sander');
module.exports = app => {
	app.get('/api/files/browse',(req,res)=>{
		var gitPath = server.git.getPath();
		var folderPath = path.join(gitPath,'src/static/uploads/files');
		var items = [];
		try{
			items = sander.readdirSync(folderPath);
		}catch(err){
		}
		res.json({
			items
		})
	});
};