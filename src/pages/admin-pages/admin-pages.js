module.exports = function() {
	return {
		name: 'pages',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {

				Vue.component('page-editor', {
					props: ['enabled', "page"],
					template: `<div  class="page-editor-component" v-show="!!page">
						<label class="important">Pagina <span v-html="page && page.label"></span></label>
						<codemirror ref="htmlEditor" :enabled="enabled" v-model="htmlData"></codemirror>
						<label class="important">Avanzado</label>
						<codemirror ref="jsEditor" :enabled="enabled" v-model="jsData"></codemirror>
						<button class="btn" @click="saveParameters" v-html="progress?'Guardando...':'Guardar'"></button>
					</div>`,
					data() {
						return {
							jsData: '',
							htmlData: '',
							progress: false
						}
					},
					watch: {
						page() {
							this.jsData = this.page && this.page.jsData
							this.htmlData = this.page && this.page.htmlData
							window.jsEditor = this.$refs.jsEditor
							this.$refs.jsEditor.setValue(this.jsData);
							this.$refs.htmlEditor.setValue(this.htmlData);

						}
					},
					methods: {
						saveParameters() {
							this.progress = true;
							apiPost('/api/git/path', {
								files: [{
									contents: this.jsData,
									path: this.page.jsPath
								}, {
									contents: this.htmlData,
									path: this.page.htmlPath
								}],
								path: this.page.basePath
							}).then(r => {
								this.progress = false;
								if (!r.result) {
									new Noty({
										layout: 'bottomCenter',
										text: "Error",
										type: 'error',
										killer: true,
										delay: false
									}).show();
								} else {
									new Noty({
										timeout: 2500,
										layout: 'bottomCenter',
										text: "Los cambios se aplicaran la proxima vez que publique el sitio.",
										type: 'info',
										killer: true
									}).show();
								}
							});
						}
					}
				});

				new Vue({
					el: '.admin',
					name: 'adminPages',
					data() {
						return {
							pages: [],
							pageItem:null
						}
					},
					created() {
						apiGet('/api/pages').then(r => {
							this.pages = r.result;
						});
					},
					mounted() {},
					methods: {
						onPageSelected(page) {
							this.pageItem = page;
						}
					}
				});



			}
		}
	}
}