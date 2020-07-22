const execa = require('execa');
var multer = require('multer')
var upload = multer({
	dest: 'uploads/'
});
var sander = require('sander');
var path = require('path');
module.exports = app => {
	var server = require('../src/server');



	app.post('/api/upload/single', upload.single('singleFile'), async function(req, res, next) {
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
		var type = req.body.type || 'images';
		var fileName = req.file.originalname;
		var basePath = `src/static/uploads/${type}/`;
		var targetBasePath = path.join(process.cwd(),basePath);
		var targetPath = path.join(targetBasePath, fileName);
		await sander.mkdir(targetBasePath);
		await execa.command(`mv ${req.file.path} ${targetPath}`);
		
		const outputFolder = require('path').join(process.cwd(), 'docs');
		await execa.command(`cd ${outputFolder} && cp ${targetPath} .`,{
			shell:true,
			stdout:process.stdout
		});

		res.json({
			file: req.file
		})
	})
}