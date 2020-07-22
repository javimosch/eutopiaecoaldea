const path = require('path');
const sander = require('sander');
const dJSON = require('dirty-json');
module.exports = app => {

	app.post('/api/pages/save', async (req,res)=>{
		await sander.writeFile(path.join(process.cwd(),req.body.jsPath),req.body.jsData)
		await sander.writeFile(path.join(process.cwd(),req.body.htmlPath),req.body.htmlData)
		res.json({
			result:true
		})
	})

	app.get('/api/pages', async (req, res) => {
		let pagesPath= path.join(process.cwd(),'src/pages')
		var folders = await sander.readdir(pagesPath);
		return res.json({
			result: await Promise.all(folders.filter(f => {
				if (false && !req.query.adminPages) {
					if(f.indexOf('faq')!==-1){
						return true;
					}
					//return f.indexOf('admin') == -1;
					return true;
				} else {
					return true;
				}
			}).map(f => {
				return (async f => {
					var jsPath = path.join('src/pages', f, f + '.js')
					var htmlPath = path.join('src/pages', f, f + '.html')
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