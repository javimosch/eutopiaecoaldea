module.exports = function() {
	return {
		name: 'voluntarios',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				new Vue({
					el: '.admin',
					name: 'adminVoluntarios',
					data() {
						return Object.assign({
							voluntarios: window.voluntarios.map(v=>{
								v._expand = false
								return v;
							})
						}, {});
					},
					created(){
						fetch(`${SERVER.API_URL}/api/voluntarios/fetch`).then(r => r.json().then(response => {
							this.voluntarios = response.result.map(v=>{
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