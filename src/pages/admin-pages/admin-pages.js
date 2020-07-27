module.exports = function () {
	return {
		name: 'pages',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {

				Vue.component('page-editor', {
					props: ['enabled', 'value'],
					template: `<div  class="page-editor-component" v-show="!!value">
						<label class="important">Pagina <span v-html="value && value.label"></span></label>
						<codemirror @input="change" mode="html" ref="htmlEditor" :enabled="enabled" v-model="htmlData"></codemirror>
						<label class="important">Avanzado</label>
						<codemirror @input="change" ref="jsEditor" :enabled="enabled" v-model="jsData"></codemirror>
						
					</div>`,
					data() {
						return {
							jsData: '',
							htmlData: '',

						}
					},
					methods: {
						setEditorValues(value) {
							console.log(value)
							this.jsData = value && value.jsData
							this.htmlData = value && value.htmlData
							window.jsEditor = this.$refs.jsEditor
							this.$refs.jsEditor.setValue(this.jsData);
							this.$refs.htmlEditor.setValue(this.htmlData);
						},
						change(v) {
							if (this.value && v) {
								this.$emit('input', {
									...this.value,
									jsData: this.jsData,
									htmlData: this.htmlData
								})
							}
						}
					}
				});

				window.vues = window.vues || {};
				window.vues['main'] = new Vue({
					el: '.appScope',
					name: 'adminPages',
					data() {
						return {
							pages: [],
							pageItem: {},
							isSaving: false
						}
					},
					created() {
						apiGet('/api/pages').then(r => {
							this.pages = r.result;
						});
						let self = this
						this.onSaveKey = function (e) {
							if ((e.which == '115' || e.which == '83') && (e.ctrlKey || e.metaKey) && !(e.altKey)) {
								e.preventDefault();
								if(Object.keys(self.pageItem).length>0){
									self.savePage()
								}
								return false;
							}
							return true;
						}
						$(document).on('keydown',this.onSaveKey);

					},
					destroyed(){
						$(document).off('keydown',this.onSaveKey);
					},
					methods: {
						selectedClass(page) {
							return `${page.label == this.pageItem.label ? 'select_item__selected' : ''}`
						},
						onPageSelected(page) {
							this.pageItem = Object.assign(this.pageItem, page)

							this.$refs.pageEditor.setEditorValues(this.pageItem)
						},
						savePage() {
							this.isSaving = true;
							apiPost('/api/pages/save', {
								...this.pageItem
							}).then(r => {
								this.isSaving = false;
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
										text: "Pagina guardada.",
										type: 'info',
										killer: true
									}).show();
								}
							});
						}
					}
				});



			}
		}
	}
}