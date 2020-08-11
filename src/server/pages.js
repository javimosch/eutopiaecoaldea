const path = require('path');
const sander = require('sander');
const Handlebars = require('handlebars');
const dJSON = require('dirty-json');
const reload = require('require-reload')(require);
const livereload = require('./livereload');
const { match } = require('assert');

const pages = []

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
	getPage(url, fallbackPage = ""){
		let matches = []
		//console.log('getPage', url, pages.length)
		for(var x = 0; x < pages.length; x++){
			//console.log('search page', url, pages[x].name)
			let fullName = pages[x].name
			if(pages[x].path){
				fullName = pages[x].path + '/' + fullName
			}
			if(url.indexOf(`${fullName}`)!==-1){
				//console.log('Page found', pages[x].name)

				matches.push({
					...pages[x],
					fullName
				})
			}else{
				//console.log('skip page', pages[x].path||'',pages[x].name)
			}
		}
		if(matches.length>0){
			let bestMatch = matches.reduce((carry,item)=>{
				if(!carry){
					return item
				}
				if(carry.fullName.length<item.fullName.length){
					return item
				}else{
					return carry
				}
			}, null)
			//console.log('MATCHES',url, matches.map(m=>m.fullName), bestMatch.name)
			return bestMatch
		}

		if(fallbackPage){
			return pages.find(p=>p.partialName = fallbackPage)
		}

		return null
	},
	async getPageAsHtml(url, options = {}){
		let config = options.config
		options.language = options.language||config.defaultLanguage
		let page = this.getPage(url, options.fallbackPage)
		var context = await config.getContext(options.language);
		const source = (await sander.readFile(path.join(process.cwd(), 'src','index.html'))).toString('utf-8');
		const template = Handlebars.compile(source);
		context.currentLanguage = context.lang[options.language];
		context.currentPage =  page.partialName;
		context.langPath = options.language != config.defaultLanguage ? `${options.language}/` : ``;
		var html = template(Object.assign({}, context, page.context || {}));
		let result = injectHtml(html, page.name);
		return result.html
	},
	compile: async (options, config) => {
		
		var srcPath = path.join(process.cwd(), 'src');
		
		var srcFile = name => path.join(srcPath, name);

		var outputFolder = options.outputFolder || config.defaultOutputFolder;
		
		var basePath = path.join(process.cwd(), outputFolder);
		
		var writeFns = [];

		var pagesNames = await sander.readdir(srcFile('pages'));

		let promises = pagesNames.map(name => {

			return (async()=>{
			var source = '';
			var pageSourcePath = srcFile(`pages/${name}/${name}.html`);
			try {
				source = (await sander.readFile(pageSourcePath)).toString('utf-8');
			} catch (err) {
				return console.error('pages: source file missing at', pageSourcePath)
			}

			options.language = options.language || config.defaultLanguage

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

		
			//Register partial
			var pageName = 'page_' + normalizeName(name);

			pageConfig.partialName = pageName + '_' + options.language
			pageConfig.name = normalizeName(pageConfig.name, true)

			Handlebars.registerPartial(pageConfig.partialName, source);
			
			//console.log(`Page Partial ${pageConfig.partialName} Path ${pageConfig.path}/${pageConfig.name}`)

			let index = pages.findIndex(p=>`${p.path||''}/${p.name}`==`${pageConfig.path||''}/${pageConfig.name}`)
			if(index>=0){
				pages[index] = {
					...pageConfig,
					source
				}
			}else{
				pages.push({
					...pageConfig,
					source
				})
			}

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

		if(options.generate){
			console.log('Generating pages')
			await Promise.all(writeFns.map(fn=>fn()))
		}
	}
};

function normalizeName(name, isPageFile = false){
	if (!isPageFile) {
		name = name.split('-').join('_')
		name = name.split(' ').join('_')
	} else {
		name = name.split(' ').join('-')
		name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
	}
	return name.toLowerCase();
}
