module.exports = {
	deepMerge
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