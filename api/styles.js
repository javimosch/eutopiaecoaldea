const path = require('path');
const sander = require('sander');
const server = require('../src/server');
module.exports = app => {

	app.post('/api/styles/save', async (req, res) => {
		await sander.writeFile(path.join(process.cwd(), req.body.htmlPath), req.body.htmlData)
		res.json({
			result: true
		})
	})
	
	app.get('/api/styles', async (req, res) => {
		var pagesPath = path.join(process.cwd(), 'docs')
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