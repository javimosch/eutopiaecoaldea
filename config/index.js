require('dotenv').config({
	silent:true
});
var locales = require('./locales.js');
var self = module.exports = {
	defaultOutputFolder: 'docs',
	NODE_ENV: process.env.NODE_ENV,
	API_URL: process.env.API_URL,
	defaultLanguage: 'es',
	context:{
		defaultCurrentPage:'page_home',
		currentPage: 'page_home',
		NODE_ENV: process.env.NODE_ENV,
		API_URL: process.env.API_URL
	},
	getContext: function(language){
		//console.log('getConfig',{language})
		language = language || self.defaultLanguage;
		function collectLanguage(language){
			var lang = {};
			Object.keys(locales).forEach(setenceKey=>{
				var sentenceObject = locales[setenceKey]
				var sentenceValue = '';
				if(sentenceObject[language]){
					sentenceValue= sentenceObject[language];
				}else{
					if(sentenceObject[self.defaultLanguage]){
						sentenceValue= sentenceObject[language];	
					}else{
						sentenceValue= setenceKey;
					}
				}
				lang[setenceKey]= sentenceValue;
			});
			return lang;
		}
		return Object.assign({},self.context,{
			lang: collectLanguage(language)
		});
	}
};