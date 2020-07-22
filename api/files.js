var path = require('path');
var sander = require('sander');
module.exports = app => {
	app.get('/api/files/browse',async (req,res)=>{
		var folderPath = path.join(process.cwd(),'src/static/uploads/files');
		var items = [];
		try{
			items = await  sander.readdir(folderPath);
		}catch(err){
		}
		res.json({
			items
		})
	});
};