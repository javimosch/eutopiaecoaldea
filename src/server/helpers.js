module.exports = {
	deepMerge,
	getLogger
}

function getLogger(ns = "default"){
	function log(){
		console.log(Array.prototype.slice.call(arguments))
	}
	function create(type){
		return function(){
			var args = Array.prototype.slice.call(arguments);
			args.unshift(type.toUpperCase())
			log.apply(this,args)	
		}
	}
	return {
		debug:create('DEBUG'),
		warn:create('WARN'),
		error:create('ERROR'),
		fatal:create('FATAL')
	}
}

function deepMerge(self, savedData, options = {}) {
	if (savedData === undefined) {
		return;
	}
	Object.keys(self).forEach(k => {
		if (typeof self[k] === 'object' && !(self[k] instanceof Array)) {
			deepMerge(self[k], savedData[k]);
		} else {
			if(options.allowEmptyOverwrite && savedData[k]==='' || savedData[k]===0){
				self[k] = savedData[k];
			}else{
				self[k] = savedData[k] || self[k];
			}
		}
	});
	Object.keys(savedData).filter(k => Object.keys(self).indexOf(k) == -1).forEach(newK => {
		self[newK] = savedData[newK];
	})
}