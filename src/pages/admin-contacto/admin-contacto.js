module.exports = function() {
	return {
		name: 'formulario-de-contacto',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				window.vues=window.vues||{};
				window.vues['main']= new Vue({
					el: '.appScope',
					name: 'adminContacto',
					data() {
						return Object.assign({
							items: []
						}, {});
					},
					created() {
						fetch(`${SERVER.API_URL}/api/formularioContacto/fetch`).then(r => r.json().then(response => {
							this.items = response.result.map(v => {
								v._expand = false
								return v;
							});
						}));
					},
					mounted() {

					}
				});
			}
		}
	};
};