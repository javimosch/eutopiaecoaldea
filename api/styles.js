const path = require('path');
const sander = require('sander');
const server = require('../src/server');
module.exports = app => {
	app.get('/api/styles', async (req, res) => {
		var pagesPath = server.git.gitFilePath('docs')
		let htmlPath = 'docs/styles.css';
		return res.json({
			err: true,
			result: {
				htmlPath,
				label: 'styles.css',
				basePath: path.join('docs') + '/styles.css',
				htmlData: (await sander.readFile(htmlPath)).toString('utf-8')
			}
		});
	});
};