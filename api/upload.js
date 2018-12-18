var multer = require('multer')
var upload = multer({
	dest: 'uploads/'
});
var sander = require('sander');
var path = require('path');
module.exports = app => {
	var server = require('../src/server');
	app.post('/api/upload/images/single', upload.single('image'), function(req, res, next) {
		// req.file is the `avatar` file
		// req.body will hold the text fields, if there were any
		/*
		0: "fieldname"
		1: "originalname"
		2: "encoding"
		3: "mimetype"
		4: "destination"
		5: "filename"
		6: "path"
		7: "size"
		*/
		var fileName = req.file.originalname;
		var basePath = 'src/static/uploads/images/';
		var gitPath = server.git.getPath();
		var targetBasePath = path.join(gitPath,basePath);
		var targetPath = path.join(targetBasePath, fileName);
		sander.mkdirSync(targetBasePath);
		server.fs.execSync(`mv ${req.file.path} ${targetPath}`);
		console.log('saving image in repo')
		server.git.pushPath(`${basePath}${fileName}`,{
			branch:'latest'
		});
		res.json({
			file: req.file
		})
	})
}