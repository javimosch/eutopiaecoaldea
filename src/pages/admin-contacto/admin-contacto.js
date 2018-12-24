module.exports = function() {
	return {
		name: 'formulario-de-contacto',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				new Vue({
					el: '.admin',
					name: 'adminContacto',
					data() {
						return Object.assign({
							items: window.items.map(v=>{
								v._expand = false
								return v;
							})
						}, {});
					},
					created(){
						fetch(`${SERVER.API_URL}/api/formularioContacto/fetch`).then(r => r.json().then(response => {
							this.items = response.result.map(v=>{
								v._expand = false
								return v;
							});
						}));
					},
					mounted(){

					}
				});
			}
		}
	};
};