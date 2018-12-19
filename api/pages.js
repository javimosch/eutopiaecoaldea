const path = require('path');
const sander = require('sander');
const server = require('../src/server');
var filePath = name => path.join(process.cwd(), name);
const reload = require('require-reload')(require);
const dJSON = require('dirty-json');
module.exports = app => {
	app.get('/api/pages', async (req, res) => {
		var pagesPath = server.git.gitFilePath('src/pages')
		var folders = await sander.readdir(pagesPath);
		return res.json({
			result: await Promise.all(folders.filter(f => {
				if (!req.query.adminPages) {
					return f.indexOf('admin-') == -1;
				} else {
					return true;
				}
			}).map(f => {
				return (async f => {
					var jsPath = path.join(pagesPath, f, f + '.js')
					var htmlPath = path.join(pagesPath, f, f + '.html')
					return {
						jsPath,
						htmlPath,
						label: f,
						basePath: path.join('src/pages',f)+'/*',
						jsData: (await sander.readFile(jsPath)).toString('utf-8'),
						htmlData: (await sander.readFile(htmlPath)).toString('utf-8')
					}
				})(f);
			}))
		})
	});
};