module.exports = function(options, config, context) {
	console.log('hospedajes config', context.lang.HOSPEDAJES)
	return {
		name: context.lang.HOSPEDAJES
	}
}