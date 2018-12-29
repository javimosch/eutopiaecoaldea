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
						<button class="btn" @click="saveParameters" v-html="progress?'Guardando...':'Guardar'"></button>
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
								url: `${SERVER.API_URL}/api/git/path`,
								data: JSON.stringify({
									files: [{
										contents: this.data,
										path: path
									}],
									path: path
								}),
								contentType: "application/json; charset=utf-8",
								type: 'POST',
								error: () => {
									this.progress = false;
									console.warn('NOT SAVED')
								},
								success: (data) => {
									this.progress = false;
									console.log('SAVED')
								}
							});
						}

					}
				});


				new Vue({
					el: '.admin',
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