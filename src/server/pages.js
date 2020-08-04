const path = require('path');
const sander = require('sander');
const Handlebars = require('handlebars');
const dJSON = require('dirty-json');
const reload = require('require-reload')(require);
const livereload = require('./livereload');

function injectHtml(html, name) {
	var result = {
		html
	};
	/*
	if (process.env.NODE_ENV !== 'production') {
		const cheerio = require('cheerio')
		const $ = cheerio.load(html)
		result.app = $('.app').html();
		result.head = $('head').html();
		if (config.watchMode) {
			$('body').html($('body').html() + `
			<script src="https://cdn.jsdelivr.net/npm/socket.io-client@2.2.0/dist/socket.io.slim.min.js"></script>
			<script>
				fetch('/livereload.js?page='+window.SERVER.currentPage+'&language='+window.SERVER.currentLanguage).then(r=>r.text()).then(data=>{
					eval(data);
				})
			</script>
		`);
		}
		result.html = $.html()
	}*/
	return result;
}

module.exports = {
	injectHtml,
	compile: async (options, config) => {
		
		var srcPath = path.join(process.cwd(), 'src');
		
		var srcFile = name => path.join(srcPath, name);

		var outputFolder = options.outputFolder || config.defaultOutputFolder;
		
		var basePath = path.join(process.cwd(), outputFolder);
		
		var writeFns = [];

		var pages = await sander.readdir(srcFile('pages'));

		let promises = pages.map(name => {

			return (async()=>{
			var source = '';
			var pageSourcePath = srcFile(`pages/${name}/${name}.html`);
			try {
				source = (await sander.readFile(pageSourcePath)).toString('utf-8');
			} catch (err) {
				return console.error('pages: source file missing at', pageSourcePath)
			}

			//Context for handlebars
			var context = await config.getContext(options.language);

			var pageConfig = '';
			var pageConfigPath = srcFile(`pages/${name}/${name}.js`);
			//Parse config
			try {
				pageConfig = (await sander.readFile(pageConfigPath)).toString('utf-8');
				if (pageConfig.indexOf('module.exports') !== -1) {
					pageConfig = reload(pageConfigPath)(options, config, context);
				} else {
					pageConfig = dJSON.parse(pageConfig);
				}
			} catch (err) {
				return console.error('pages: config file missing at', pageConfigPath, {
					details: err.stack
				});
			}

			var normalizeName = (name, isPageFile = false) => {
				if (!isPageFile) {
					name = name.split('-').join('_')
					name = name.split(' ').join('_')
				} else {
					name = name.split(' ').join('-')
					name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
				}
				return name.toLowerCase();
			}

			//Register partial
			var pageName = 'page_' + normalizeName(name);

			pageConfig.name = normalizeName(pageConfig.name, true)

			Handlebars.registerPartial(pageName, source);
			//console.log(`pages: ${pageName} registered (${options.language} ${pageConfig.name.toLowerCase()})`)

			writeFns.push(async function () {
				//Write file
				source = (await sander.readFile(srcFile('index.html'))).toString('utf-8');
				var template = Handlebars.compile(source);
				context.currentLanguage = context.lang[options.language];
				context.currentPage = pageName;
				context.langPath = options.language != config.defaultLanguage ? `${options.language}/` : ``;
				var html = template(Object.assign({}, context, pageConfig.context || {}));
				var writePath = path.join(basePath, pageConfig.path || '', pageConfig.name.toLowerCase(), 'index.html');
				let result = injectHtml(html, pageConfig.name);
				let combinedContext = Object.assign({}, context, pageConfig.context || {});
				livereload.addPage(context.currentPage, result, context.currentLanguage, combinedContext);
				await sander.writeFile(writePath, result.html);
			})

			})();

		});

		await Promise.all(promises)
		await Promise.all(writeFns.map(fn=>fn()))
	}
};