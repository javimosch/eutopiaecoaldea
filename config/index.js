require('dotenv').config({
	silent: true
});
const dJSON = require('dirty-json');
const argv = require('yargs').argv
var locales = require('./locales.js');
var self = module.exports = {
	defaultOutputFolder: 'docs',
	NODE_ENV: process.env.NODE_ENV,
	defaultLanguage: 'es',
	languages: ['es','en','fr','pr','de'],
	argv,
	watchMode: argv.w || argv.watch,
	context: {
		langPath:'es/',
		defaultCurrentPage: 'page_ecoaldea',
		currentPage: 'page_ecoaldea',
		NODE_ENV: process.env.NODE_ENV,
		API_URL: process.env.API_URL
	},
	async init(){
		await mergeDataFile();
	},
	getContext: async function(language = "es") {
		//console.log('getConfig',{language})
		language = language || self.defaultLanguage;

		await mergeDataFile();

		function collectLanguage(language) {
			var lang = {};
			Object.keys(locales).forEach(setenceKey => {
				var sentenceObject = locales[setenceKey]
				var sentenceValue = '';
				if (sentenceObject[language]) {
					sentenceValue = sentenceObject[language];
				} else {
					if (sentenceObject[self.defaultLanguage]) {
						sentenceValue = sentenceObject[self.defaultLanguage];
					} else {
						sentenceValue = setenceKey;
					}
				}
				lang[setenceKey] = sentenceValue;
			});
			//console.log('LANG',language,JSON.stringify(lang,null,4))
			return lang;
		}
		var result = Object.assign({}, self.context, {
			lang: collectLanguage(language)
		});
		result.currentLanguage = result.lang[language];
		result.currentLanguageCode = language;

		Object.assign(result, {
			API_URL: process.env.API_URL || self.context.API_URL
		});

		return result;
	}
};



async function mergeDataFile() {
	var data = (await require('sander').readFile(__dirname + '/data.js')).toString('utf-8');
	var savedData = {}
	try {
		savedData = dJSON.parse(data);

	} catch (err) {
		console.error('config: invalid data')
	}
	merge(self, savedData);
}


function merge(self, savedData) {
	if (savedData === undefined) {
		return;
	}
	Object.keys(self).forEach(k => {
		if (typeof self[k] === 'object' && !(self[k] instanceof Array)) {
			merge(self[k], savedData[k]);
		} else {
			self[k] = savedData[k] || self[k];
		}
	});
	Object.keys(savedData).filter(k => Object.keys(self).indexOf(k) == -1).forEach(newK => {
		self[newK] = savedData[newK];
	})
}