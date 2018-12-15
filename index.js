const outputFolder = require('path').join(process.cwd(), 'docs');

const argv = require('yargs').argv;
const server = require('./src/server');
var exec = server.fs.execSync;
var rimraf = server.fs.rimraf;
const sander = require('sander');
const path = require('path');

if (argv.s || argv.server) {

	//var testFile = path.join(process.cwd(), 'deploy.pub')
	//var gitPath = server.git.getPath();
	//exec(`cd ${gitPath}; cd src/static; cp ${testFile} .`)
	//server.git.pushPath('src/*');

	
	runLocalServer();
	if (argv.a || argv.api) {

	} else {
		compileEntireSite();
	}
} else {
	if (argv.b || argv.build) {
		compileEntireSite();
		console.log('Site compiled');
	} else {
		if (argv.d || argv.deploy) {
			if (argv.a || argv.api) {
				console.log('Commiting and deploying api')
				exec('git add api/*; git add index.js;git commit -m "auto:api";git stash; git pull --rebase origin master; git stash pop;git push heroku master');
			} else {
				compileEntireSite();
				exec('git add docs/*; git commit -m "auto"; git stash; git pull --rebase origin master; git stash pop; git push origin master');
			}
		}
	}
}

function compileEntireSite() {
	if (process.env.NODE_ENV === 'production') {
		exec(`cd ${process.cwd()}; cp ${path.join(outputFolder,'CNAME')} .`)
		rimraf(path.join(outputFolder, '/**'), '/docs/');
		exec(`mkdir ${outputFolder}; echo 1;`);
		exec(`cd ${outputFolder}; cp ${path.join(process.cwd(),'CNAME')} .; rm ${path.join(process.cwd(),'CNAME')}`)
	}
	
	exec(`cd ${outputFolder}; cp -R ../src/static/* .`);

	//Helpers
	loadHandlebarHelpers()

	//Styles
	if(process.env.NODE_ENV==='production'){
		compileStyles();
	}

	//Javascript
	//server.webpack.compile();


	//Generate site
	compileSiteOnce({
		language: 'es'
	});
	compileSiteOnce({
		language: 'en',
		outputFolder: 'docs/en'
	});
	compileSiteOnce({
		language: 'fr',
		outputFolder: 'docs/fr'
	});
	compileSiteOnce({
		language: 'de',
		outputFolder: 'docs/de'
	});
	compileSiteOnce({
		language: 'pr',
		outputFolder: 'docs/pr'
	});
}

function compileStyles() {
	const config = require('./config');
	var outputFolder = config.defaultOutputFolder;
	var basePath = path.join(process.cwd(), outputFolder);
	var srcPath = path.join(process.cwd(), 'src');
	var srcFile = name => path.join(srcPath, name);
	var fileName = name => path.join(basePath, name);
	var sass = require('node-sass');
	var css = sass.renderSync({
		file: srcFile('styles/main.scss')
	}).css.toString('utf-8')
	sander.writeFileSync(fileName('styles.css'), css);
	return css.length + ' characters written.'
}

function loadHandlebarHelpers() {
	const Handlebars = require('handlebars');

	var H = require('just-handlebars-helpers');
	H.registerHelpers(Handlebars);

	Handlebars.registerHelper('bold', function(options) {
		return new Handlebars.SafeString(
			'<div class="mybold">' +
			options.fn(this) +
			'</div>');
	});
	Handlebars.registerHelper('capitalize', function(options) {
		var result = options.fn(this);
		result = result.charAt(0).toUpperCase() + result.substring(1);
		return new Handlebars.SafeString(result);
	});

	Handlebars.registerHelper('pagePath', function(langPath, name, options) {
		name = name.split(' ').join('-')
		name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
		name = name.toLowerCase();
		return `/${langPath}${name}`;
	});

	Handlebars.registerHelper('typeIs', function(obj, value, options) {
		if (typeof obj == value) {
			return true;
		} else {
			return false;
		}
	});

	Handlebars.registerHelper('toString', function(result, options) {
		result = result.toString('utf-8');
		return new Handlebars.SafeString(result);
	});
	/*
	Handlebars.registerHelper('if', function(conditional, options) {
	  if(conditional) {
	    return options.fn(this);
	  } else {
	    return options.inverse(this);
	  }
	});
	*/
}


function compileSiteOnce(options = {}) {

	//Partials and Pages
	const config = require('./config');
	server.partials.compile(options, config);
	server.pages.compile(options, config);

	//Index (Home page)
	const Handlebars = require('handlebars');

	const path = require('path');
	const sander = require('sander');
	var outputFolder = options.outputFolder || config.defaultOutputFolder;
	var basePath = path.join(process.cwd(), outputFolder);
	var srcPath = path.join(process.cwd(), 'src');
	var fileName = name => path.join(basePath, name);
	var srcFile = name => path.join(srcPath, name);

	var source = sander.readFileSync(srcFile('index.html')).toString('utf-8');
	var template = Handlebars.compile(source);
	var context = config.getContext(options.language);
	context.currentLanguage = context.lang[options.language];
	context.currentPage = context.defaultCurrentPage;
	context.langPath = options.language != config.defaultLanguage ? `${options.language}/` : ``;
	var html = template(context);
	sander.writeFileSync(fileName('index.html'), html);


}

function runLocalServer() {
	const express = require('express');
	const app = express();
	var cors = require('cors')

	app.use(cors());

	const port = process.env.PORT || 3000;

	if (argv.a || argv.api) {
		app.get('/', function(req, res) {
			return res.send('API OK');
		});
		createApiRoutes(app);
	} else {
		app.use('/', express.static(outputFolder));
		createApiRoutes(app);
	}

	app.listen(port, () => {
		if (argv.a || argv.api) {
			console.log(`Local server listening on port ${port}! (API MODE)`);
		} else {
			console.log(`Local server listening on port ${port}!`);
		}
	});
}

function createApiRoutes(app) {
	require('./api')(app);
}