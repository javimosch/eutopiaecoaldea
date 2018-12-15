const outputFolder = require('path').join(process.cwd(), 'docs');

const argv = require('yargs').argv;
const server = require('./src/server');
const sander = require('sander');
const path = require('path');

if (argv.s || argv.server) {

	server.webpack.compile();

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
				exec('git add api/*; git add index.js;git commit -m "auto:api"; git push heroku master');
			} else {
				compileEntireSite();
				exec('git add docs/*; git commit -m "auto"; git push origin master');
			}
		}
	}
}

function exec(cmd) {
	if (!cmd) return console.error('exec: cmd required');
	var out = require('child_process').execSync(cmd, {
		cwd: process.cwd(),
		env: process.env,
		encoding: 'utf-8'
	});
	console.log(JSON.stringify({
		cmd,
		out
	}, null, 2));
}

function rimraf(p) {
	if (p.indexOf('/docs/') !== -1) {
		sander.rimrafSync(p);
	} else {
		console.error('WARN: check rimraf', p);
	}
}

function compileEntireSite() {
	if (process.env.NODE_ENV === 'production') {
		rimraf(path.join(outputFolder, '/**'));
	}
	exec(`mkdir ${outputFolder}; echo 1;`);
	exec(`cd ${outputFolder}; cp -R ../src/static/* .`);

	//Helpers
	loadHandlebarHelpers()

	//Generate site
	compileSiteOnce({
		language: 'es'
	});
	compileSiteOnce({
		language: 'en',
		outputFolder: 'docs/en'
	});
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
	context.currentPage = context.defaultCurrentPage;
	context.langPath = options.language != config.defaultLanguage ? `${options.language}/` : ``;
	var html = template(context);
	sander.writeFileSync(fileName('index.html'), html);

	//Styles
	compileStyles();

	//Javascript

	function compileStyles() {
		var sass = require('node-sass');
		var css = sass.renderSync({
			file: srcFile('styles/main.scss')
		}).css.toString('utf-8')
		sander.writeFileSync(fileName('styles.css'), css);
		return css.length + ' characters written.'
	}
}

function runLocalServer() {
	const express = require('express');
	const app = express();
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