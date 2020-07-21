module.exports = function() {
	return {
		name: 'partials',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {

				new Vue({
					el: '.appScope',
					name: 'adminPages',
					data() {
						return {
							items: [],
							selectedItem:{
								htmlData:''
							},
							saving:false
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
							this.$refs.htmlEditor.setValue(page.htmlData)
						},
						save() {
							this.saving = true;
							apiPost('/api/partials/save', {
								...this.selectedItem
							}).then(r => {
								this.saving = false;
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
										text: "Cambios guardados",
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