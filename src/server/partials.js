const path = require('path');
const sander = require('sander');
const Handlebars = require('handlebars');
const dJSON = require('dirty-json');

module.exports = {
	compile: async (options, config) => {
		var srcPath = path.join(process.cwd(), 'src');
		var srcFile = name => path.join(srcPath, name);
		var pages = await sander.readdir(srcFile('partials'));
		await Promise.all(pages.map(name => {
			return (async()=>{
			var source = (await sander.readFile(srcFile(`partials/${name}`))).toString('utf-8');
			var partialName= 'partial_' + name.split('.html').join('').toLowerCase()
			Handlebars.registerPartial(partialName, source);
			//console.log(`partials: ${partialName} registered (${options.language})`)
			})()	
		}));
	}
};
