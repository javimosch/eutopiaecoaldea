const path = require('path');
const sander = require('sander');
const Handlebars = require('handlebars');
const dJSON = require('dirty-json');

module.exports = {
	compile: (options, config) => {
		var srcPath = path.join(process.cwd(), 'src');
		var srcFile = name => path.join(srcPath, name);
		var pages = sander.readdirSync(srcFile('partials'));
		pages.forEach(name => {
			var source = sander.readFileSync(srcFile(`partials/${name}`)).toString('utf-8');
			var partialName= 'partial_' + name.split('.html').join('').toLowerCase()
			Handlebars.registerPartial(partialName, source);
			console.log(`partials: ${partialName} registered (${options.language})`)
		});
	}
};
