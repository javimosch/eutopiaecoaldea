var server = require('../src/server');
var path = require('path');
var sander = require('sander');
module.exports = app => {
	app.get('/api/images/browse',(req,res)=>{
		var gitPath = server.git.getPath();
		var imagesPath = path.join(gitPath,'src/static/uploads/images');
		var images = [];
		try{
			images = sander.readdirSync(imagesPath);
		}catch(err){
		}
		res.json({
			images
		})
	});
};