module.exports = function () {
	return {
		name: 'styles',
		path: 'admin',
		context: {
			type: 'admin',
			init: function init() {
				window.vues = window.vues || [];
				window.vues['main'] = new Vue({
					el: '.appScope',
					name: 'adminStyles',
					data() {
						return {
							item: {
								htmlData: ''
							},
							saving: false
						}
					},
					created() {
						apiGet('/api/styles').then(r => {
							this.item = r.result;
						});
					},
					mounted() { },
					methods: {
						save() {
							this.saving = true;
							apiPost('/api/styles/save', {
								...this.item
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
										text: "Los cambios se aplicaran la proxima vez que publique el sitio.",
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