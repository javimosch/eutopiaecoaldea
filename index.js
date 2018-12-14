const outputFolder = require('path').join(process.cwd(), 'docs');
const argv = require('yargs').argv

if (argv.s || argv.server) {
	compileEntireSite();
	runLocalServer();
} else {
	if (argv.b || argv.build) {
		compileEntireSite();
		console.log('Site compiled');
	} else {
		if (argv.d || argv.deploy) {
			compileEntireSite();
			exec('git add docs/*; git commit -m "auto"; git push origin master');
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

function compileEntireSite() {
	//Generate site
	compileSiteOnce({
		language: 'es'
	});
	compileSiteOnce({
		language: 'en',
		outputFolder: 'docs/en'
	});
}

function compileSiteOnce(options = {}) {
	const Handlebars = require('handlebars');
	const config = require('./config');
	const path = require('path');
	const sander = require('sander');
	var outputFolder = options.outputFolder || 'docs';
	var basePath = path.join(process.cwd(), outputFolder);
	var srcPath = path.join(process.cwd(), 'src');
	var fileName = name => path.join(basePath, name);
	var srcFile = name => path.join(srcPath, name);

	var source = sander.readFileSync(srcFile('index.html')).toString('utf-8');
	var template = Handlebars.compile(source);
	var context = config.getConfig(options.language);
	console.log('compileSite', {
		styles: compileStyles(),
		//context
	});
	var html = template(context);
	sander.writeFileSync(fileName('index.html'), html);

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
	app.use('/', express.static(outputFolder));
	app.listen(port, () => console.log(`Local server listening on port ${port}!`));
}