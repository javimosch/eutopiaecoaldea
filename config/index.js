require('dotenv').config({
	silent: true
});
const dJSON = require('dirty-json');

var locales = require('./locales.js');
var self = module.exports = {
	defaultOutputFolder: 'docs',
	NODE_ENV: process.env.NODE_ENV,
	defaultLanguage: 'es',
	context: {
		defaultCurrentPage: 'page_ecoaldea',
		currentPage: 'page_ecoaldea',
		NODE_ENV: process.env.NODE_ENV,
		API_URL: process.env.API_URL
	},
	getContext: function(language) {
		//console.log('getConfig',{language})
		language = language || self.defaultLanguage;

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
		return result;
	}
};


var data = require('sander').readFileSync(__dirname + '/data.js').toString('utf-8');
var savedData = {}
try {
	savedData = dJSON.parse(data);

} catch (err) {
	console.error('config: invalid data')
}
//Object.assign(self, savedData || {});
merge(self,savedData);
function merge(self, savedData) {
	if(savedData===undefined){
		return;
	}
	Object.keys(self).forEach(k => {
		if (typeof self[k] === 'object' && !(self[k] instanceof Array)) {
			merge(self[k],savedData[k]);
		} else {
			self[k] = savedData[k] || self[k];
		}
	});
}


Object.assign(self.context, {
	API_URL: process.env.API_URL || self.context.API_URL
});