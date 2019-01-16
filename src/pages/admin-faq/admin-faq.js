module.exports = function() {
	return {
		name: 'faq',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				window.vues=window.vues||{}
				window.vues['main']= new Vue({
					el: '.admin',
					name: 'adminFaq',
					data() {
						return {
							
						}
					},
					created() {
						
					},
					mounted() {},
					methods: {
						
					}
				});



			}
		}
	}
}