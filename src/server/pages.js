const path = require('path');
const sander = require('sander');
const Handlebars = require('handlebars');
const dJSON = require('dirty-json');
const reload = require('require-reload')(require);

module.exports = {
	compile: (options, config) => {
		var srcPath = path.join(process.cwd(), 'src');
		var srcFile = name => path.join(srcPath, name);

		var outputFolder = options.outputFolder || config.defaultOutputFolder;
		var basePath = path.join(process.cwd(), outputFolder);
		var srcPath = path.join(process.cwd(), 'src');


		var pages = sander.readdirSync(srcFile('pages'));
		pages.forEach(name => {

			var source = '';
			var pageSourcePath = srcFile(`pages/${name}/${name}.html`);
			try {
				source = sander.readFileSync(pageSourcePath).toString('utf-8');
			} catch (err) {
				return console.error('pages: source file missing at', pageSourcePath)
			}

			//Context for handlebars
			var context = config.getContext(options.language);

			var pageConfig = '';
			var pageConfigPath = srcFile(`pages/${name}/${name}.js`);
			//Parse config
			try {
				pageConfig = sander.readFileSync(pageConfigPath).toString('utf-8');
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
				if(!isPageFile){
					name = name.split('-').join('_')
					name = name.split(' ').join('_')
				}else{
					name = name.split(' ').join('-')
					name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
				}
				return name.toLowerCase();
			}

			//Register partial
			var pageName = 'page_' + normalizeName(name);

			pageConfig.name = normalizeName(pageConfig.name, true)

			Handlebars.registerPartial(pageName, source);

			//Write file
			source = sander.readFileSync(srcFile('index.html')).toString('utf-8');
			var template = Handlebars.compile(source);
			context.currentLanguage = context.lang[options.language];
			context.currentPage = pageName;
			context.langPath = options.language != config.defaultLanguage ? `${options.language}/` : ``;
			var html = template(Object.assign({}, context, pageConfig.context || {}));
			var writePath = path.join(basePath, pageConfig.path || '', pageConfig.name.toLowerCase(), 'index.html');
			sander.writeFileSync(writePath, html);


			//console.log(`pages: ${pageName} registered (${options.language} ${pageConfig.name.toLowerCase()})`)
		});
	}
};