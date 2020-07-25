const path = require('path');
const sander = require('sander');
const server = require('../src/server');
const execa = require('execa');

module.exports = app => {

	app.post('/api/styles/save', async (req, res) => {
		await sander.writeFile(path.join(req.body.htmlPath), req.body.htmlData)

		const outputFolder = require('path').join(process.cwd(), 'docs');
		await execa.command(`cd ${outputFolder} && cp -R ../src/static/styles.css .`,{
			shell:true,
			stdout:process.stdout
		});

		res.json({
			result: true
		})
	})
	
	app.get('/api/styles', async (req, res) => {
		htmlPath = path.join(process.cwd(),'src/static/styles.css')
		return res.json({
			err: true,
			result: {
				htmlPath,
				label: 'styles.css',
				htmlData: (await sander.readFile(htmlPath)).toString('utf-8')
			}
		});
	});
};