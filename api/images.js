var server = require('../src/server');
var path = require('path');
var sander = require('sander');
var rp = require('request-promise');
var config = require('../config');
module.exports = app => {

	app.get('/api/images/link/:name', (req, res) => {
		var gitPath = server.git.getPath();
		var imagesPath = path.join(gitPath, 'src/static/uploads/images', req.params.name);
		res.sendFile(imagesPath);
	});

	app.get('/api/images/browse', (req, res) => {
		var gitPath = server.git.getPath();
		var imagesPath = path.join(gitPath, 'src/static/uploads/images');
		var images = [];
		try {
			images = sander.readdirSync(imagesPath);
		} catch (err) {}
		res.json({
			images:images.map(image=>({
				name: image,
				link: path.join(config.context.API_URL,'/api/images/link', image).split(':/').join('://')
			}))
		})
	});

	app.post('/api/images/remove', async (req, res) => {
		if (!req.body.name) {
			return res.json({
				err: 400,
				result: false
			});
		}
		var imagesPath = path.join('src/static/uploads/images');
		var removePath = path.join(imagesPath, req.body.name);
		//await sander.unlink(removePath);
		server.git.pushPath(`${imagesPath}/`, {
			branch: 'latest',
			unlink: [removePath]
		});
		res.json({
			err: null,
			result: true
		});
	});
};