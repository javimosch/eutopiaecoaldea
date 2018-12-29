module.exports = function() {
	return {
		name: 'partials',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {

				Vue.component('partial-editor', {
					props: ['enabled', "item"],
					template: `<div  class="partial-editor-component" v-show="!!item">
						<label class="important">Vista parcial <span v-html="item && item.label"></span></label>
						<hr>
						<codemirror ref="htmlEditor" :enabled="enabled" v-model="htmlData"></codemirror>
					</div>`,
					data() {
						return {
							jsData: '',
							htmlData: '',
							progress: false
						}
					},
					watch: {
						item() {
							this.htmlData = this.item && this.item.htmlData
							this.$refs.htmlEditor.setValue(this.htmlData, -1);
						}
					},
					methods: {
						saveParameters() {
							this.progress = true;
							apiPost('/api/git/path', {
								files: [{
									contents: this.htmlData,
									path: this.item.htmlPath
								}],
								path: this.item.basePath
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
							items: [],
							selectedItem:null
						}
					},
					created() {
						apiGet('/api/partials').then(r => {
							this.items = r.result;
						});
					},
					mounted() {},
					methods: {
						onPageSelected(page) {
							this.selectedItem = page;
						}
					}
				});



			}
		}
	}
}