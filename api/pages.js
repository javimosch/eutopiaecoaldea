const path = require('path');
const sander = require('sander');
const dJSON = require('dirty-json');
module.exports = app => {

	app.post('/api/pages/save', async (req, res) => {
		await sander.writeFile(path.join(process.cwd(), req.body.jsPath), req.body.jsData)
		await sander.writeFile(path.join(process.cwd(), req.body.htmlPath), req.body.htmlData)
		res.json({
			result: true
		})
	})

	app.get('/api/pages/remove', async (req,res)=>{
		if(req.query.name){
			await sander.rimraf(process.cwd(),'src/pages',req.query.name)
		}
		res.status(200).send()
	})

	app.get('/api/pages/add', async (req, res) => {
		let name = normalizeName(req.query.name)
		let srcHtml = path.join(process.cwd(), 'src/pages', name, name + '.html')
		let srcJs = path.join(process.cwd(), 'src/pages', name, name + '.js')
		const exists = await sander.exists(srcHtml)
		if (!exists) {
			await sander.writeFile(srcHtml, `
			<section class="container">
		
			</section>
			`)
			await sander.writeFile(srcJs, `
			module.exports = function(options, config, context) {
				return {
					name: '${name}',
					context: {
						init: function init() {
						}
					}
				};
			};
			`)
		}
		res.status(200).send()
	})

	app.get('/api/pages', async (req, res) => {
		let pagesPath = path.join(process.cwd(), 'src/pages')
		var folders = await sander.readdir(pagesPath);
		return res.json({
			result: await Promise.all(folders.filter(f => {
				return f.indexOf('admin') === -1;
			}).map(f => {
				return (async f => {
					var jsPath = path.join('src/pages', f, f + '.js')
					var htmlPath = path.join('src/pages', f, f + '.html')
					return {
						jsPath,
						htmlPath,
						label: f,
						basePath: path.join('src/pages', f) + '/*',
						jsData: (await sander.readFile(jsPath)).toString('utf-8'),
						htmlData: (await sander.readFile(htmlPath)).toString('utf-8')
					}
				})(f);
			}))
		})
	});
};

function normalizeName(name = "") {
	name = name.split('-').join('_')
	name = name.split(' ').join('-')
	name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
	return name.toLowerCase();
}
