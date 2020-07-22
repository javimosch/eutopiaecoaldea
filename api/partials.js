const path = require('path');
const sander = require('sander');
const dJSON = require('dirty-json');
module.exports = app => {

	app.post('/api/partials/save', async (req,res)=>{
		await sander.writeFile(path.join(process.cwd(),req.body.htmlPath),req.body.htmlData)
		res.json({
			result:true
		})
	})

	app.get('/api/partials', async (req, res) => {
		var pagesPath = path.join(process.cwd(),'src/partials')
		var folders = await sander.readdir(pagesPath);
		return res.json({
			result: await Promise.all(folders.filter(f => {
				if (!req.query.adminPages) {
					return f.indexOf('admin') == -1;
				} else {
					return true;
				}
			}).map(f => {
				return (async f => {
					var htmlPath = path.join('src/partials', f);
					return {
						htmlPath,
						label: f,
						basePath: path.join('src/partials')+'/*',
						htmlData: (await sander.readFile(htmlPath)).toString('utf-8')
					}
				})(f);
			}))
		})
	});
};