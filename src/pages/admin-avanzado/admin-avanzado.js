module.exports = function() {
	return {
		name: 'avanzado',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {

				Vue.component('parameters', {
					props: ['enabled', "type"],
					template: `<div  class="parameters-component">
						<codemirror :enabled="enabled" v-model="data"></codemirror>
						<button class="btn" @click="saveParameters" :disabled="progress">Guardar</button>
					</div>`,
					data() {
						return {
							data: '',
							progress: false
						}
					},
					created() {
						var url = ({
							data: 'config/fetch',
							locales: 'locales/fetch'
						})[this.type || 'data']
						fetch(`${SERVER.API_URL}/api/${url}`).then(r => r.json().then(response => {
							this.data = response.result;
						}));
					},
					mounted() {

					},
					methods: {
						saveParameters() {
							this.progress = true;
							var path = ({
								data: 'config/data.js',
								locales: 'config/locales.js'
							})[this.type || 'data']
							$.ajax({
								url: `${SERVER.API_URL}/api/advanced/${this.type}/save`,
								data: JSON.stringify({
									path,
									contents: this.data
								}),
								contentType: "application/json; charset=utf-8",
								type: 'POST',
								error: () => {
									this.progress = false;
									console.warn('NOT SAVED')
								},
								success: (data) => {
									this.progress = false;
									new Noty({
										timeout: 2500,
										layout: 'bottomCenter',
										text: "Informacion actualizada.",
										type: 'info',
										killer: true
									}).show();
								}
							});
						}

					}
				});


				new Vue({
					el: '.appScope',
					name: 'adminAvanzado',
					data() {
						return {
							
						}
					},
					created() {
						
					},
					mounted() {
					},
					methods: {
					
					}
				})

			}
		}
	}
}