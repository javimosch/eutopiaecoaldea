module.exports = function() {
	return {
		name: 'voluntarios',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				window.vues=window.vues||{}
				window.vues['pageVue'] = new Vue({
					el: '.admin',
					name: 'adminVoluntarios',
					data() {
						return {
							voluntarios: []
						}
					},
					created(){
						fetch(`${SERVER.API_URL}/api/voluntarios/fetch`).then(r => r.json().then(response => {
							this.voluntarios = response.result.map(v=>{
								v._expand = false
								return v;
							}).sort((a,b)=>{
								var bd = moment(b.date,'DD-MM-YYYY HH:mm');
								return moment(a.date,'DD-MM-YYYY HH:mm').isAfter(bd) ? -1 : 1
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