module.exports = function() {
	return {
		name: 'dashboard',
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

				Vue.component('codemirror', {
					props: ['value', 'enabled'],
					template: `<div  class="codemirror-component">
						<div ref="editor" style="width: -webkit-fill-available;height: 300px;"></div>
					</div>`,
					data() {
						return {
							editor: null,
							init: false,
							activated: false
						}
					},
					watch: {
						value() {
							if (!!this.editor && !this.init) {
								this.editor.setValue(this.value, -1);
								this.init = true;
							}
						},
						enabled() {
							if (this.enabled === true && !this.activated) {
								this.activate();
							}
						}
					},
					methods: {
						activate() {
							if (this.activated) return;
							this.activated = true;
							var editor = ace.edit(this.$refs.editor);
							editor.setTheme("ace/theme/monokai");
							editor.session.setMode("ace/mode/javascript");
							this.editor = editor;
							this.editor.on('change', () => {
								var value = this.editor.getValue();
								console.log('change', value);
								this.$emit('input', value);
							});
							if (!!this.value) {
								this.editor.setValue(this.value, -1);
							}
						}
					},
					mounted() {
						if (this.enabled || this.enabled === undefined) {
							this.activate();
						}
					}
				});

				new Vue({
					el: '.admin',
					name: 'admin_dashboard',
					data() {
						return {
							waitingUpdate: false,
							uploading: false,
							single_image: null,
							images: [],
							deployedAt: '',
							collapsables: {
								upload_image: false,
								view_images: false,
								parameters: false,
								deploy: true
							}
						}
					},
					created() {
						fetch(`/manifest.json`).then(r => r.json().then(response => {
							this.deployedAt = moment(response.created_at, 'x').format('DD-MM-YY HH:mm');
						}));

						var updateCode = window.localStorage.getItem('updateCode');
						if (!!updateCode) {
							if (SERVER.updateCode != updateCode) {
								this.waitingUpdate = true;
							} else {
								window.localStorage.setItem('updateCode', '')
							}
						}



					},
					mounted() {
						this.browseImages();
					},
					methods: {

						deploy,
						uploadImage,
						browseImages
					}
				})

				function deploy() {
					this.uploading = true;
					fetch(`${SERVER.API_URL}/api/deployment/publish`).then(r => r.json().then(response => {
						window.localStorage.setItem('updateCode', response.updateCode);
						this.waitingUpdate = true;
						this.uploading = false;
						console.info('updateCode', response.updateCode)
					}));
				}

				function browseImages() {
					fetch(`${SERVER.API_URL}/api/images/browse`).then(r => r.json().then(response => {
						this.images = response.images;
					}));
				}

				function uploadImage() {
					var data = new FormData();
					var file = $('#image')[0].files[0];
					data.append('image', file);
					this.uploading = true;
					$.ajax({
						url: `${SERVER.API_URL}/api/upload/images/single`,
						data: data,
						cache: false,
						contentType: false,
						processData: false,
						type: 'POST',
						error: () => {
							this.uploading = false;
							$('#image').val('');
						},
						success: (data) => {
							this.uploading = false;
							$('#image').val('');
							alert('Image uploaded!')
						}
					});
				}
			}
		}
	}
}